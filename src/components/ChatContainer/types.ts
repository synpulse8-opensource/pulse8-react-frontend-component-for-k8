import type { IMessage, ChatTheme } from '../../types'

export interface IChatContainerProps {
    messages: IMessage[]
    isStreaming?: boolean
    onSuggestedQuestionClick?: (question: string) => void
    theme?: Partial<ChatTheme>
    emptyStateTitle?: string
}
