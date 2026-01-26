import type { IMessage, ChatTheme } from '../../types'

export interface IMessageProps {
    message: IMessage
    hasReply?: boolean
    isLatest?: boolean
    isStreaming?: boolean
    messages?: IMessage[]
    onSuggestedQuestionClick?: (question: string) => void
    theme?: Partial<ChatTheme>
}
