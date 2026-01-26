import type { IMessage, ChatTheme } from '../../types'

export interface IUserMessageProps {
    message: IMessage
    hasReply?: boolean
    theme?: Partial<ChatTheme>
}
