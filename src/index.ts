// ============================================================================
// Configuration & Context
// ============================================================================

// ChatConfigProvider - wrap your app to provide custom configuration
export { ChatConfigProvider, useChatConfig, defaultEventAdapter } from './context'
export type { IChatConfig, IChatConfigProviderProps, IStreamEvent } from './context'

// ============================================================================
// Main Components
// ============================================================================

// ChatPanel - the main chat component combining messages and input
export { ChatPanel } from './components/ChatPanel'
export type { IChatPanelProps } from './components/ChatPanel'

// Individual components for custom layouts
export { ChatContainer } from './components/ChatContainer'
export type { IChatContainerProps } from './components/ChatContainer'
export { ChatInput } from './components/ChatInput'
export { ChatInputMinimal } from './components/ChatInputMinimal'
export type { IChatInputMinimalProps } from './components/ChatInputMinimal'
export { Message } from './components/Message'
export type { IMessageProps } from './components/Message'
export { UserMessage } from './components/UserMessage'
export type { IUserMessageProps } from './components/UserMessage'
export { AssistantMessage } from './components/AssistantMessage'
export type { IAssistantMessageProps } from './components/AssistantMessage'
export { MessageContentRenderer } from './components/MessageContentRenderer'
export type { IMessageContentRendererProps } from './components/MessageContentRenderer'
export { SuggestedQuestions } from './components/SuggestedQuestions'
export type { ISuggestedQuestionsProps } from './components/SuggestedQuestions'

// Error Boundaries
export { ErrorBoundary, MessageErrorBoundary } from './components/ErrorBoundary'
export type { IErrorBoundaryProps, IMessageErrorBoundaryProps } from './components/ErrorBoundary'

// ============================================================================
// Hooks
// ============================================================================

export { useChatMessages } from './hooks/useChatMessages'
export type { ISendMessageParams, IUseChatMessagesOptions } from './hooks/useChatMessages'

export { useModelSelection } from './hooks/useModelSelection'
export type { IUseModelSelectionOptions, IModelOption } from './hooks/useModelSelection'

// ============================================================================
// Types
// ============================================================================

// Core message types
export type {
    IMessage,
    IToolOutput,
    IContentSegment,
    IPdfFile,
    MessageRole,
    ChatTheme,
} from './types'

// Chart types for custom chart implementations
export type { IChartData, IChartRendererProps, IChartSeriesData } from './types'
export { parseChartData } from './types'

// ============================================================================
// Theme
// ============================================================================

export { defaultTheme, mergeTheme } from './theme'

// ============================================================================
// Pre-built Adapters (also available via @pulse8-ai/chat/adapters)
// ============================================================================

// OpenAI
export { createOpenAIAdapter, openAITextAdapter } from './adapters'

// Anthropic
export { createAnthropicAdapter, anthropicTextAdapter } from './adapters'

// Google Gemini
export { createGeminiAdapter, geminiTextAdapter } from './adapters'

// Adapter types
export type {
    EventAdapter,
    IOpenAIStreamChunk,
    IAnthropicStreamEvent,
    IGeminiStreamChunk,
} from './adapters'

// ============================================================================
// Streaming Utilities (also available via @pulse8-ai/chat/utils)
// ============================================================================

export { streamSSE, parseSSELine, createSSEParser } from './utils'
export type { ISSEParserOptions, IStreamSSEOptions } from './utils'

// ============================================================================
// UI Components (also available via @pulse8-ai/chat/ui)
// ============================================================================

export * from './components/ui'

// ============================================================================
// Icons/Assets
// ============================================================================

// Default assistant icon
export { AssistantIcon } from './assets'
export type { AssistantIconProps } from './assets'

// Utility icons
export { StopCircleIcon, MicIcon, ChecksIcon } from './assets'
