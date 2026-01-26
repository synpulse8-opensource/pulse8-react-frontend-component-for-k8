import type { IStreamEvent } from '../context/ChatConfigContext'

/**
 * Function signature for event adapters
 * Transforms raw backend events to the standard IStreamEvent format
 */
export type EventAdapter = (rawEvent: unknown) => IStreamEvent | null

/**
 * Options for creating streaming API handlers
 */
export interface IStreamingOptions {
    /** The URL or Request to fetch */
    url: string | Request
    /** Request body (will be JSON stringified) */
    body?: Record<string, unknown>
    /** Additional headers */
    headers?: Record<string, string>
    /** HTTP method (defaults to POST) */
    method?: 'GET' | 'POST'
    /** Abort signal for cancellation */
    signal?: AbortSignal
    /** Callback for each parsed event */
    onEvent: (event: IStreamEvent) => void
    /** Callback when streaming completes */
    onComplete: () => void
    /** Callback for errors */
    onError: (error: Error) => void
}

/**
 * Raw OpenAI streaming chunk format
 */
export interface IOpenAIStreamChunk {
    id?: string
    object?: string
    created?: number
    model?: string
    choices?: Array<{
        index?: number
        delta?: {
            role?: string
            content?: string | null
            tool_calls?: Array<{
                index?: number
                id?: string
                type?: string
                function?: {
                    name?: string
                    arguments?: string
                }
            }>
        }
        finish_reason?: string | null
    }>
    usage?: {
        prompt_tokens?: number
        completion_tokens?: number
        total_tokens?: number
    }
}

/**
 * Raw Anthropic streaming event format
 */
export interface IAnthropicStreamEvent {
    type:
        | 'message_start'
        | 'content_block_start'
        | 'content_block_delta'
        | 'content_block_stop'
        | 'message_delta'
        | 'message_stop'
        | 'ping'
        | 'error'
    index?: number
    message?: {
        id?: string
        type?: string
        role?: string
        content?: Array<{ type: string; text?: string }>
        model?: string
        stop_reason?: string | null
        usage?: { input_tokens?: number; output_tokens?: number }
    }
    content_block?: {
        type: string
        text?: string
        id?: string
        name?: string
        input?: Record<string, unknown>
    }
    delta?: {
        type?: string
        text?: string
        partial_json?: string
        stop_reason?: string
    }
    error?: {
        type?: string
        message?: string
    }
}

/**
 * Raw Google Gemini streaming chunk format
 */
export interface IGeminiStreamChunk {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string
                functionCall?: {
                    name?: string
                    args?: Record<string, unknown>
                }
                functionResponse?: {
                    name?: string
                    response?: Record<string, unknown>
                }
            }>
            role?: string
        }
        finishReason?: string
        safetyRatings?: Array<{
            category?: string
            probability?: string
        }>
    }>
    usageMetadata?: {
        promptTokenCount?: number
        candidatesTokenCount?: number
        totalTokenCount?: number
    }
}
