import type { IStreamEvent } from '../context/ChatConfigContext'
import type { EventAdapter } from '../adapters/types'

/**
 * Maximum allowed size for JSON payloads in bytes (1MB default)
 * Prevents DoS attacks via extremely large payloads
 */
export const DEFAULT_MAX_JSON_SIZE = 1024 * 1024

/**
 * Maximum allowed nesting depth for JSON objects (100 levels default)
 * Prevents stack overflow from deeply nested malicious payloads
 */
export const DEFAULT_MAX_JSON_DEPTH = 100

/**
 * Options for SSE parser
 */
export interface ISSEParserOptions {
    /** Custom field to extract data from (defaults to 'data') */
    dataField?: string
    /** Whether to parse JSON automatically (defaults to true) */
    parseJson?: boolean
    /** Maximum size in bytes for JSON payloads (default: 1MB) */
    maxJsonSize?: number
    /** Maximum nesting depth for JSON objects (default: 100) */
    maxJsonDepth?: number
}

/**
 * Checks if JSON string exceeds the maximum allowed size
 *
 * @param jsonString - The JSON string to check
 * @param maxSize - Maximum allowed size in bytes
 * @returns true if the size is acceptable, false if it exceeds the limit
 */
const checkJsonSize = (jsonString: string, maxSize: number): boolean => {
    // Use Blob to get accurate byte size (handles UTF-8 properly)
    const size = new Blob([jsonString]).size
    return size <= maxSize
}

/**
 * Checks if a parsed JSON object exceeds the maximum allowed depth
 *
 * @param obj - The object to check
 * @param maxDepth - Maximum allowed depth
 * @param currentDepth - Current depth (used for recursion)
 * @returns true if depth is acceptable, false if it exceeds the limit
 */
const checkJsonDepth = (obj: unknown, maxDepth: number, currentDepth = 0): boolean => {
    if (currentDepth > maxDepth) {
        return false
    }

    if (obj === null || typeof obj !== 'object') {
        return true
    }

    if (Array.isArray(obj)) {
        for (const item of obj) {
            if (!checkJsonDepth(item, maxDepth, currentDepth + 1)) {
                return false
            }
        }
    } else {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (
                    !checkJsonDepth(
                        (obj as Record<string, unknown>)[key],
                        maxDepth,
                        currentDepth + 1,
                    )
                ) {
                    return false
                }
            }
        }
    }

    return true
}

/**
 * Safely parses JSON with size and depth limits to prevent DoS attacks
 *
 * @param jsonString - The JSON string to parse
 * @param maxSize - Maximum allowed size in bytes
 * @param maxDepth - Maximum allowed nesting depth
 * @returns The parsed object or null if parsing fails or limits are exceeded
 */
export const safeJsonParse = (
    jsonString: string,
    maxSize: number = DEFAULT_MAX_JSON_SIZE,
    maxDepth: number = DEFAULT_MAX_JSON_DEPTH,
): unknown | null => {
    // Check size limit
    if (!checkJsonSize(jsonString, maxSize)) {
        console.warn(`JSON payload exceeds maximum size limit of ${maxSize} bytes`)
        return null
    }

    try {
        const parsed = JSON.parse(jsonString)

        // Check depth limit
        if (!checkJsonDepth(parsed, maxDepth)) {
            console.warn(`JSON payload exceeds maximum depth limit of ${maxDepth}`)
            return null
        }

        return parsed
    } catch {
        return null
    }
}

/**
 * Options for streamSSE helper
 */
export interface IStreamSSEOptions {
    /** The URL to fetch */
    url: string
    /** Request body (will be JSON stringified) */
    body?: Record<string, unknown>
    /** Additional headers */
    headers?: Record<string, string>
    /** HTTP method (defaults to POST) */
    method?: 'GET' | 'POST'
    /** Abort signal for cancellation */
    signal?: AbortSignal
    /** Event adapter to transform raw events to IStreamEvent */
    adapter: EventAdapter
    /** Callback for each parsed event */
    onEvent: (event: IStreamEvent) => void
    /** Callback when streaming completes */
    onComplete: () => void
    /** Callback for errors */
    onError: (error: Error) => void
}

/**
 * Parse a single SSE line into data
 *
 * Includes security protections against malicious payloads:
 * - Size limits to prevent DoS via large payloads
 * - Depth limits to prevent stack overflow from deeply nested objects
 *
 * @param line - The SSE line to parse
 * @param options - Parser options including security limits
 * @returns The parsed data or null if parsing fails or limits are exceeded
 *
 * @example
 * ```ts
 * const data = parseSSELine('data: {"content": "hello"}')
 * // { content: "hello" }
 *
 * // With custom limits
 * const data = parseSSELine(line, { maxJsonSize: 512 * 1024, maxJsonDepth: 50 })
 * ```
 */
export function parseSSELine(line: string, options: ISSEParserOptions = {}): unknown | null {
    const {
        dataField = 'data',
        parseJson = true,
        maxJsonSize = DEFAULT_MAX_JSON_SIZE,
        maxJsonDepth = DEFAULT_MAX_JSON_DEPTH,
    } = options

    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith(':')) return null

    // Check for data field
    const prefix = `${dataField}:`
    if (!trimmed.startsWith(prefix)) return null

    const content = trimmed.slice(prefix.length).trim()

    // Handle [DONE] token (OpenAI style)
    if (content === '[DONE]') return null

    if (parseJson) {
        const parsed = safeJsonParse(content, maxJsonSize, maxJsonDepth)
        // If parsing returned null but content exists, return as string
        if (parsed === null && content) {
            return content
        }
        return parsed
    }

    return content
}

/**
 * Creates a streaming SSE parser that handles chunked data
 *
 * @example
 * ```ts
 * const parser = createSSEParser({
 *   onData: (data) => console.log('Received:', data),
 * })
 *
 * // Feed chunks as they arrive
 * parser.feed(chunk1)
 * parser.feed(chunk2)
 * ```
 */
export function createSSEParser(options: {
    onData: (data: unknown) => void
    parserOptions?: ISSEParserOptions
}): {
    feed: (chunk: string) => void
    reset: () => void
} {
    let buffer = ''

    const feed = (chunk: string) => {
        buffer += chunk

        // Process complete lines
        const lines = buffer.split('\n')
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() ?? ''

        for (const line of lines) {
            const data = parseSSELine(line, options.parserOptions)
            if (data !== null) {
                options.onData(data)
            }
        }
    }

    const reset = () => {
        buffer = ''
    }

    return { feed, reset }
}

/**
 * Stream SSE responses with automatic parsing and adapter transformation
 *
 * This is the main utility for connecting to streaming AI APIs.
 *
 * @example
 * ```tsx
 * import { streamSSE } from '@pulse8-ai/chat/utils'
 * import { createOpenAIAdapter } from '@pulse8-ai/chat/adapters'
 *
 * await streamSSE({
 *   url: 'https://api.openai.com/v1/chat/completions',
 *   headers: { Authorization: `Bearer ${apiKey}` },
 *   body: {
 *     model: 'gpt-4',
 *     messages: [{ role: 'user', content: 'Hello!' }],
 *     stream: true,
 *   },
 *   adapter: createOpenAIAdapter(),
 *   onEvent: (event) => console.log(event),
 *   onComplete: () => console.log('Done!'),
 *   onError: (error) => console.error(error),
 * })
 * ```
 */
export async function streamSSE(options: IStreamSSEOptions): Promise<void> {
    const {
        url,
        body,
        headers = {},
        method = 'POST',
        signal,
        adapter,
        onEvent,
        onComplete,
        onError,
    } = options

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        if (!response.body) {
            throw new Error('Response body is null')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        const parser = createSSEParser({
            onData: (data) => {
                const event = adapter(data)
                if (event) {
                    onEvent(event)
                }
            },
        })

        try {
            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    onComplete()
                    break
                }

                const chunk = decoder.decode(value, { stream: true })
                parser.feed(chunk)
            }
        } catch (error) {
            // Handle abort
            if (error instanceof Error && error.name === 'AbortError') {
                onComplete()
                return
            }
            throw error
        }
    } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)))
    }
}
