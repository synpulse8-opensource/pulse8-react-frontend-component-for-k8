import type { IStreamEvent } from '../context/ChatConfigContext'
import type { EventAdapter, IOpenAIStreamChunk } from './types'

/**
 * Tracks the state of tool calls being accumulated across multiple chunks
 */
interface IToolCallState {
    id: string
    name: string
    arguments: string
}

/**
 * Creates an OpenAI event adapter with optional tool call state tracking
 *
 * @example
 * ```tsx
 * const adapter = createOpenAIAdapter()
 *
 * // In your streaming handler:
 * const event = adapter(rawChunk)
 * if (event) onEvent(event)
 * ```
 */
export function createOpenAIAdapter(): EventAdapter {
    // Track tool calls being built up across chunks
    const toolCallsInProgress = new Map<number, IToolCallState>()

    return (rawEvent: unknown): IStreamEvent | null => {
        if (typeof rawEvent !== 'object' || rawEvent === null) return null

        const chunk = rawEvent as IOpenAIStreamChunk
        const choice = chunk.choices?.[0]

        if (!choice) return null

        const delta = choice.delta

        // Handle text content
        if (delta?.content) {
            return {
                type: 'llm_token',
                content: delta.content,
            }
        }

        // Handle tool calls (function calling)
        if (delta?.tool_calls) {
            const events: IStreamEvent[] = []

            for (const toolCall of delta.tool_calls) {
                const index = toolCall.index ?? 0

                // New tool call starting
                if (toolCall.function?.name) {
                    toolCallsInProgress.set(index, {
                        id: toolCall.id ?? `tool_${index}`,
                        name: toolCall.function.name,
                        arguments: toolCall.function.arguments ?? '',
                    })

                    return {
                        type: 'tool_start',
                        tool_name: toolCall.function.name,
                        input: toolCall.function.arguments,
                    }
                }

                // Accumulating arguments for existing tool call
                if (toolCall.function?.arguments) {
                    const existing = toolCallsInProgress.get(index)
                    if (existing) {
                        existing.arguments += toolCall.function.arguments
                    }
                }
            }

            if (events.length > 0) return events[0]
        }

        // Handle finish reason (tool call complete)
        if (choice.finish_reason === 'tool_calls') {
            // Emit tool_end for all accumulated tool calls
            for (const [, toolCall] of toolCallsInProgress) {
                return {
                    type: 'tool_end',
                    tool_name: toolCall.name,
                    output: toolCall.arguments,
                }
            }
            toolCallsInProgress.clear()
        }

        return null
    }
}

/**
 * Simple stateless OpenAI adapter for text-only responses
 * Use this if you don't need tool/function calling support
 *
 * @example
 * ```tsx
 * // Simple text-only adapter
 * const event = openAITextAdapter(rawChunk)
 * ```
 */
export const openAITextAdapter: EventAdapter = (rawEvent: unknown): IStreamEvent | null => {
    if (typeof rawEvent !== 'object' || rawEvent === null) return null

    const chunk = rawEvent as IOpenAIStreamChunk
    const content = chunk.choices?.[0]?.delta?.content

    if (content) {
        return {
            type: 'llm_token',
            content,
        }
    }

    return null
}
