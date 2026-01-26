import type { IMessage, ChatTheme } from '../../types'

export interface IMessageContentRendererProps {
    message: IMessage
    theme?: Partial<ChatTheme>
}
