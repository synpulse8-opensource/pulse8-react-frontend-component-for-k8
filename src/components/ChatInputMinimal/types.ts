import type { ChatTheme } from '../../types'

export interface IChatInputMinimalProps {
    onUploadFile: (file: File) => Promise<void>
    onSend: (message: string) => void
    onStop: () => void
    isStreaming: boolean
    theme?: Partial<ChatTheme>
    acceptedFileTypes?: string[]
    placeholder?: string
    className?: string
}
