import {
    PaperClipIcon,
    MicrophoneIcon,
    PaperAirplaneIcon,
    StopCircleIcon,
} from '@heroicons/react/24/outline'
import type { IChatInputMinimalProps } from './types'
import { useChatInputHandler } from '../../hooks/useChatInputHandler'
import { mergeTheme } from '../../theme'

export type { IChatInputMinimalProps }

export const ChatInputMinimal = ({
    className,
    isStreaming,
    acceptedFileTypes = ['.pdf'],
    placeholder,
    theme,
    onSend,
    onStop,
    onUploadFile,
}: IChatInputMinimalProps) => {
    const {
        input,
        setInput,
        handleKeyDown,
        handleSend,
        fileInputRef,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        dragOver,
        handleFileChange,
        handleMicrophoneClick,
        isRecording,
    } = useChatInputHandler({
        onSend,
        isStreaming,
        acceptedFileTypes,
        onUploadFile,
    })
    const fullTheme = mergeTheme(theme)
    const colors = fullTheme.colors

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = colors.buttonSecondary!
    }

    const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = 'transparent'
    }

    return (
        <div
            className={`p-4 flex flex-col relative rounded-lg gap-2 border transition-all ${className}`}
            style={{
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {dragOver && (
                <div
                    className='absolute inset-0 flex items-center justify-center rounded-lg z-10'
                    style={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <PaperClipIcon className='w-12 h-12' style={{ color: colors.text }} />
                </div>
            )}
            <textarea
                className='w-full h-full resize-none outline-none focus:outline-none border-none ring-0 focus:ring-0 shadow-none p-0 bg-transparent'
                placeholder={placeholder ?? 'Type a new message'}
                rows={3}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                    color: colors.text,
                    backgroundColor: 'transparent',
                }}
                value={input}
                disabled={isStreaming || isRecording}
            />
            <div className='flex flex-row justify-between'>
                <div className='flex items-center gap-3'>
                    <button
                        type='button'
                        className='p-1 rounded transition-all cursor-pointer disabled:cursor-not-allowed'
                        aria-label='Attach file'
                        onClick={() => {
                            fileInputRef.current?.click()
                        }}
                        style={{ color: colors.textTertiary }}
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                        disabled={isStreaming}
                    >
                        <input
                            ref={fileInputRef}
                            type='file'
                            className='hidden'
                            accept={acceptedFileTypes.join(',')}
                            onChange={handleFileChange}
                        />
                        <PaperClipIcon className='w-6 h-6' />
                    </button>
                    <button
                        type='button'
                        className='p-1 rounded transition-all cursor-pointer disabled:cursor-not-allowed'
                        aria-label='Record audio'
                        style={{ color: colors.textTertiary }}
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                        onClick={handleMicrophoneClick}
                        disabled={isStreaming}
                    >
                        {isRecording ? (
                            <StopCircleIcon className='w-6 h-6' />
                        ) : (
                            <MicrophoneIcon className='w-6 h-6' />
                        )}
                    </button>
                </div>
                <button
                    type='button'
                    className='p-1 rounded transition-all cursor-pointer disabled:cursor-not-allowed'
                    aria-label={isStreaming ? 'Stop messages' : 'Send message'}
                    onClick={isStreaming ? onStop : handleSend}
                    style={{ color: colors.textTertiary }}
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                    disabled={isRecording}
                >
                    {isStreaming ? (
                        <StopCircleIcon className='w-6 h-6' />
                    ) : (
                        <PaperAirplaneIcon className='w-6 h-6' />
                    )}
                </button>
            </div>
        </div>
    )
}
