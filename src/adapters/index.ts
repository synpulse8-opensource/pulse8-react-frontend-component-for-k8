// ============================================================================
// Pre-built Event Adapters
// ============================================================================

// OpenAI adapters
export { createOpenAIAdapter, openAITextAdapter } from './openai'

// Anthropic adapters
export { createAnthropicAdapter, anthropicTextAdapter } from './anthropic'

// Google Gemini adapters
export { createGeminiAdapter, geminiTextAdapter } from './gemini'

// ============================================================================
// Types
// ============================================================================

export type {
    EventAdapter,
    IStreamingOptions,
    IOpenAIStreamChunk,
    IAnthropicStreamEvent,
    IGeminiStreamChunk,
} from './types'
