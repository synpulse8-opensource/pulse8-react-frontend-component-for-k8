import type { IStreamEvent } from '../context/ChatConfigContext'
import type { EventAdapter, IGeminiStreamChunk } from './types'

/**
 * Creates a Google Gemini event adapter with function calling support
 *
 * @example
 * ```tsx
 * const adapter = createGeminiAdapter()
 *
 * // In your streaming handler:
 * const event = adapter(rawChunk)
 * if (event) onEvent(event)
 * ```
 */
export function createGeminiAdapter(): EventAdapter {
    return (rawEvent: unknown): IStreamEvent | null => {
        if (typeof rawEvent !== 'object' || rawEvent === null) return null

        const chunk = rawEvent as IGeminiStreamChunk
        const candidate = chunk.candidates?.[0]

        if (!candidate?.content?.parts) return null

        for (const part of candidate.content.parts) {
            // Handle text content
            if (part.text) {
                return {
                    type: 'llm_token',
                    content: part.text,
                }
            }

            // Handle function calls
            if (part.functionCall) {
                return {
                    type: 'tool_start',
                    tool_name: part.functionCall.name ?? 'unknown_function',
                    input: JSON.stringify(part.functionCall.args ?? {}),
                }
            }

            // Handle function responses (tool results)
            if (part.functionResponse) {
                return {
                    type: 'tool_end',
                    tool_name: part.functionResponse.name ?? 'unknown_function',
                    output: JSON.stringify(part.functionResponse.response ?? {}),
                }
            }
        }

        return null
    }
}

/**
 * Simple stateless Gemini adapter for text-only responses
 *
 * @example
 * ```tsx
 * const event = geminiTextAdapter(rawChunk)
 * ```
 */
export const geminiTextAdapter: EventAdapter = (rawEvent: unknown): IStreamEvent | null => {
    if (typeof rawEvent !== 'object' || rawEvent === null) return null

    const chunk = rawEvent as IGeminiStreamChunk
    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text

    if (text) {
        return {
            type: 'llm_token',
            content: text,
        }
    }

    return null
}
