import type { IStreamEvent } from '../context/ChatConfigContext'
import type { EventAdapter, IAnthropicStreamEvent } from './types'

/**
 * Tracks tool use blocks being accumulated
 */
interface IToolUseState {
    id: string
    name: string
    input: string
}

/**
 * Creates an Anthropic Claude event adapter with tool use support
 *
 * @example
 * ```tsx
 * const adapter = createAnthropicAdapter()
 *
 * // In your streaming handler:
 * const event = adapter(rawEvent)
 * if (event) onEvent(event)
 * ```
 */
export function createAnthropicAdapter(): EventAdapter {
    // Track tool use blocks being built
    const toolUseInProgress = new Map<number, IToolUseState>()

    return (rawEvent: unknown): IStreamEvent | null => {
        if (typeof rawEvent !== 'object' || rawEvent === null) return null

        const event = rawEvent as IAnthropicStreamEvent

        switch (event.type) {
            case 'content_block_start':
                // Check if this is a tool_use block starting
                if (event.content_block?.type === 'tool_use') {
                    const index = event.index ?? 0
                    toolUseInProgress.set(index, {
                        id: event.content_block.id ?? `tool_${index}`,
                        name: event.content_block.name ?? 'unknown_tool',
                        input: '',
                    })

                    return {
                        type: 'tool_start',
                        tool_name: event.content_block.name ?? 'unknown_tool',
                    }
                }
                return null

            case 'content_block_delta':
                // Handle text delta
                if (event.delta?.type === 'text_delta' && event.delta.text) {
                    return {
                        type: 'llm_token',
                        content: event.delta.text,
                    }
                }

                // Handle tool input JSON delta
                if (event.delta?.type === 'input_json_delta' && event.delta.partial_json) {
                    const index = event.index ?? 0
                    const existing = toolUseInProgress.get(index)
                    if (existing) {
                        existing.input += event.delta.partial_json
                    }
                }
                return null

            case 'content_block_stop': {
                // Check if a tool use block finished
                const index = event.index ?? 0
                const toolUse = toolUseInProgress.get(index)
                if (toolUse) {
                    toolUseInProgress.delete(index)
                    return {
                        type: 'tool_end',
                        tool_name: toolUse.name,
                        output: toolUse.input,
                    }
                }
                return null
            }

            case 'error':
                return {
                    type: 'error',
                    message: event.error?.message ?? 'Unknown Anthropic API error',
                }

            case 'message_start':
            case 'message_delta':
            case 'message_stop':
            case 'ping':
                // These events don't produce UI updates
                return null

            default:
                return null
        }
    }
}

/**
 * Simple stateless Anthropic adapter for text-only responses
 * Use this if you don't need tool use support
 *
 * @example
 * ```tsx
 * const event = anthropicTextAdapter(rawEvent)
 * ```
 */
export const anthropicTextAdapter: EventAdapter = (rawEvent: unknown): IStreamEvent | null => {
    if (typeof rawEvent !== 'object' || rawEvent === null) return null

    const event = rawEvent as IAnthropicStreamEvent

    if (event.type === 'content_block_delta' && event.delta?.text) {
        return {
            type: 'llm_token',
            content: event.delta.text,
        }
    }

    if (event.type === 'error') {
        return {
            type: 'error',
            message: event.error?.message ?? 'Unknown error',
        }
    }

    return null
}
