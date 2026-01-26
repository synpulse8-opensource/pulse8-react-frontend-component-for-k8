import type { IMessage, ChatTheme } from '../../types'

export interface IAssistantMessageProps {
    message: IMessage
    isStreaming?: boolean
    isLatestMessage?: boolean
    messages?: IMessage[] // Optional: if not provided, isLatestMessage should be set explicitly
    theme?: Partial<ChatTheme>
}
