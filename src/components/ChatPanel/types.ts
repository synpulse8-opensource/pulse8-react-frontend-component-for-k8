import type { IMessage, IPdfFile, ChatTheme } from '../../types'
import type { IModelOption } from '../../hooks/useModelSelection'

/**
 * Props for the ChatPanel component - the main chat UI combining messages and input.
 *
 * @example
 * ```tsx
 * <ChatPanel
 *   messages={messages}
 *   isStreaming={isStreaming}
 *   onSendMessage={(msg) => sendMessage(msg, 'gpt-4')}
 *   onStopStreaming={stopStreaming}
 *   emptyStateTitle="How can I help you today?"
 *   theme={customTheme}
 * />
 * ```
 */
export interface IChatPanelProps {
    /** Additional CSS class names to apply to the container */
    className?: string
    /** Array of chat messages to display */
    messages: IMessage[]
    /** Whether the AI is currently streaming a response */
    isStreaming: boolean
    /** Callback when user sends a message */
    onSendMessage: (message: string) => void
    /** Callback to stop the current streaming response */
    onStopStreaming: () => void
    /** Array of uploaded PDF files attached to the conversation */
    uploadedPdfs?: IPdfFile[]
    /**
     * Callback for uploading a PDF file.
     * Should return the UUID of the uploaded file.
     * @param file - The file to upload
     * @param onProgress - Progress callback (0-100)
     * @returns Promise resolving to the uploaded file UUID
     */
    onUploadPdf?: (file: File, onProgress: (percent: number) => void) => Promise<string>
    /** Callback to remove an uploaded PDF by UUID */
    onRemovePdf?: (uuid: string) => void
    /** Callback to clear the chat history */
    onClearChat?: () => void
    /** Custom title text shown when there are no messages */
    emptyStateTitle?: string
    /** Custom theme to override default styling */
    theme?: Partial<ChatTheme>
    /** Available AI models for selection */
    availableModels?: IModelOption[]
    /** Currently selected model ID */
    selectedModel?: string
    /** Callback when user changes the selected model */
    onModelChange?: (modelId: string) => void
}
