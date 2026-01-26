import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { KeyboardEvent } from 'react'
import { XMarkIcon, DocumentPlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'
import { ArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline'
import type { IPdfFile, ChatTheme } from '../../types'
import { mergeTheme } from '../../theme'
import { K8Icon, StopCircleIcon, MicIcon } from '../../assets'
import { ModelSelector } from '../ui/ModelSelector'
import type { IModelOption } from '../../hooks/useModelSelection'
import { useChatInputHandler } from '../../hooks/useChatInputHandler'

interface IChatInputProps {
    onSend: (message: string) => void
    onStop: () => void
    disabled: boolean
    uploadedPdfs?: IPdfFile[]
    onUploadPdf?: (file: File, onProgress: (percent: number) => void) => Promise<string>
    // Returns UUID
    onRemovePdf?: (uuid: string) => void
    onClearChat?: () => void
    theme?: Partial<ChatTheme>
    // Model selection
    availableModels?: IModelOption[]
    selectedModel?: string
    onModelChange?: (modelId: string) => void
}

export const ChatInput: React.FC<IChatInputProps> = ({
    onSend,
    onStop: _onStop,
    disabled,
    uploadedPdfs = [],
    onUploadPdf,
    onRemovePdf,
    onClearChat,
    theme,
    availableModels = [],
    selectedModel,
    onModelChange,
}: IChatInputProps) => {
    const fullTheme = mergeTheme(theme)
    const colors = fullTheme.colors
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [currentFileName, setCurrentFileName] = useState('')
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Wrapper for file upload to handle progress and state
    const handleUploadFile = useCallback(
        async (file: File) => {
            if (!onUploadPdf) return

            try {
                setUploading(true)
                setCurrentFileName(file.name)
                setUploadProgress(0)

                await onUploadPdf(file, (percent) => {
                    setUploadProgress(percent)
                })
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error)
                alert(`Failed to upload ${file.name}`)
            } finally {
                setUploading(false)
                setCurrentFileName('')
                setUploadProgress(0)
            }
        },
        [onUploadPdf],
    )

    const {
        input,
        setInput,
        handleSend: hookHandleSend,
        handleFileChange,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        handleMicrophoneClick,
        dragOver,
        fileInputRef,
        isRecording,
    } = useChatInputHandler({
        onSend,
        isStreaming: disabled,
        acceptedFileTypes: ['.pdf'],
        onUploadFile: handleUploadFile,
    })

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false)
            }
        }

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showMenu])

    const handleSend = () => {
        if (isRecording) {
            handleMicrophoneClick() // Stops recording
        }
        hookHandleSend()
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handlePlusClick = () => {
        setShowMenu(!showMenu)
    }

    const handleAddPdf = () => {
        setShowMenu(false)
        fileInputRef.current?.click()
    }

    const handleNewChat = () => {
        if (onClearChat && confirm('Start a new chat? Current conversation will be cleared.')) {
            onClearChat()
            setInput('')
        }
        setShowMenu(false)
    }

    // Compute send/microphone button styles and title
    const hasInput = input.trim().length > 0
    const getButtonStyle = () => {
        if (hasInput) return { backgroundColor: colors.toolContainerBg }
        if (isRecording) return { backgroundColor: colors.buttonDanger }
        return {}
    }
    const buttonStyle = getButtonStyle()

    const buttonTitle = (() => {
        if (hasInput) return 'Send message'
        if (isRecording) return 'Stop recording'
        return 'Start voice input'
    })()

    return (
        <div className='w-full max-w-4xl mx-auto space-y-3'>
            {/* Uploaded PDFs List */}
            {uploadedPdfs.length > 0 && (
                <div className='space-y-2' role='list' aria-label='Uploaded files'>
                    {uploadedPdfs.map((pdf) => (
                        <div
                            key={pdf.uuid}
                            className='flex items-center justify-between border shadow-sm rounded-lg px-4 py-3 transition-all hover:shadow-md'
                            style={{
                                backgroundColor: colors.toolContainerBg,
                                borderColor: colors.toolContainerBorder,
                            }}
                            role='listitem'
                        >
                            <div className='flex items-center gap-3 flex-1 min-w-0'>
                                <DocumentIcon
                                    className='w-5 h-5 shrink-0'
                                    style={{ color: colors.info }}
                                    aria-hidden='true'
                                />
                                <span
                                    className='text-sm font-medium truncate'
                                    style={{ color: colors.textMuted }}
                                >
                                    {pdf.name}
                                </span>
                            </div>
                            {onRemovePdf && (
                                <button
                                    onClick={() => onRemovePdf(pdf.uuid)}
                                    disabled={disabled}
                                    className='ml-2 p-1.5 rounded-full transition-all disabled:opacity-50'
                                    style={{ color: colors.textTertiary }}
                                    onMouseEnter={(e) => {
                                        if (!disabled) {
                                            e.currentTarget.style.color = colors.buttonDanger!
                                            e.currentTarget.style.backgroundColor =
                                                colors.buttonDangerBgHover!
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!disabled) {
                                            e.currentTarget.style.color = colors.textTertiary!
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                        }
                                    }}
                                    title='Remove PDF'
                                    aria-label={`Remove ${pdf.name}`}
                                    type='button'
                                >
                                    <XMarkIcon className='w-4 h-4' aria-hidden='true' />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div
                    className='border rounded-lg p-4 shadow-sm'
                    style={{
                        backgroundColor: colors.uploadProgressBg,
                        borderColor: colors.uploadProgressBorder,
                    }}
                >
                    <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-2 min-w-0 flex-1'>
                            <DocumentIcon
                                className='w-5 h-5 shrink-0'
                                style={{ color: colors.info }}
                            />
                            <span
                                className='text-sm font-medium truncate'
                                style={{ color: colors.textMuted }}
                            >
                                {currentFileName}
                            </span>
                        </div>
                        <div className='flex items-center gap-3 shrink-0'>
                            <div
                                className='w-32 h-2 rounded-full overflow-hidden'
                                style={{ backgroundColor: colors.borderTertiary }}
                            >
                                <div
                                    className='h-full transition-all duration-300'
                                    style={{
                                        width: `${uploadProgress}%`,
                                        background: `linear-gradient(to right, ${colors.info}, ${colors.primaryLight})`,
                                    }}
                                />
                            </div>
                            <span
                                className='text-sm font-medium min-w-[40px] text-right'
                                style={{ color: colors.textTertiary }}
                            >
                                {Math.round(uploadProgress)}%
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Model Selector */}
            {availableModels.length > 0 && selectedModel && onModelChange && (
                <div className='flex items-center justify-end'>
                    <ModelSelector
                        availableModels={availableModels}
                        selectedModel={selectedModel}
                        onModelChange={onModelChange}
                        disabled={disabled}
                        theme={theme}
                    />
                </div>
            )}

            {/* Chat Input Container with Drag & Drop - Figma Design */}
            <div
                className={
                    'relative flex items-center gap-3 rounded-full backdrop-blur-sm border px-2 py-1.5 transition-all duration-200'
                }
                style={{
                    backgroundColor: dragOver ? colors.dragOverBorderBg : colors.inputContainerBg,
                    borderColor: dragOver ? colors.info : colors.border,
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {/* Drag Over Overlay */}
                {dragOver && (
                    <div
                        className='absolute inset-0 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10 rounded-full'
                        style={{ backgroundColor: colors.dragOverlayBg }}
                    >
                        <div className='flex flex-col items-center gap-2'>
                            <DocumentPlusIcon className='w-8 h-8' style={{ color: colors.info }} />
                            <p className='text-sm font-medium' style={{ color: colors.text }}>
                                Drop PDF files here
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Icon with Menu - Left Side */}
                <div className='relative' ref={menuRef}>
                    <button
                        onClick={handlePlusClick}
                        disabled={uploading}
                        className='flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-all disabled:opacity-50 overflow-hidden'
                        style={{
                            background: `linear-gradient(to bottom right, ${colors.aiIconGradientFrom}, ${colors.aiIconGradientTo})`,
                        }}
                        onMouseEnter={(e) => {
                            if (!uploading) {
                                e.currentTarget.style.background = `linear-gradient(to bottom right, ${colors.aiIconGradientFromHover}, ${colors.aiIconGradientToHover})`
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!uploading) {
                                e.currentTarget.style.background = `linear-gradient(to bottom right, ${colors.aiIconGradientFrom}, ${colors.aiIconGradientTo})`
                            }
                        }}
                        title='Menu'
                        aria-label='Open chat options menu'
                        aria-expanded={showMenu}
                        aria-haspopup='menu'
                        type='button'
                    >
                        <K8Icon className='w-full h-full' aria-hidden='true' />
                    </button>
                    {showMenu && (
                        <div
                            className='absolute bottom-full left-0 mb-2 w-48 rounded-lg shadow-xl border py-1 z-50'
                            style={{
                                backgroundColor: colors.toolContainerBg,
                                borderColor: colors.toolContainerBorder,
                            }}
                            role='menu'
                            aria-label='Chat options'
                        >
                            {onUploadPdf && (
                                <button
                                    onClick={handleAddPdf}
                                    disabled={uploading}
                                    className='w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors disabled:opacity-50'
                                    style={{ color: colors.textMuted }}
                                    onMouseEnter={(e) => {
                                        if (!uploading) {
                                            e.currentTarget.style.backgroundColor =
                                                colors.buttonSecondary!
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!uploading)
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                    }}
                                    role='menuitem'
                                    type='button'
                                >
                                    <DocumentPlusIcon
                                        className='w-5 h-5'
                                        style={{ color: colors.info }}
                                        aria-hidden='true'
                                    />
                                    <span className='text-sm font-medium'>Add PDF</span>
                                </button>
                            )}
                            {onClearChat && (
                                <button
                                    onClick={handleNewChat}
                                    disabled={disabled}
                                    className='w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors disabled:opacity-50'
                                    style={{ color: colors.textMuted }}
                                    onMouseEnter={(e) => {
                                        if (!disabled) {
                                            e.currentTarget.style.backgroundColor =
                                                colors.buttonSecondary!
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!disabled)
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                    }}
                                    role='menuitem'
                                    type='button'
                                >
                                    <ChatBubbleLeftRightIcon
                                        className='w-5 h-5'
                                        style={{ color: colors.success }}
                                        aria-hidden='true'
                                    />
                                    <span className='text-sm font-medium'>New Chat</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Hidden File Input */}
                {onUploadPdf && (
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='.pdf,application/pdf'
                        multiple
                        className='hidden'
                        onChange={handleFileChange}
                        aria-label='Upload PDF files'
                    />
                )}

                {/* Input */}
                <style>{`
                    .chat-input-field::placeholder {
                        color: ${colors.inputPlaceholder};
                    }
                `}</style>
                <input
                    id='chat-input'
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                        disabled
                            ? 'Generating...'
                            : isRecording
                                ? 'Listening...'
                                : 'Ask K8 anything...'
                    }
                    disabled={disabled || isRecording}
                    className='flex-1 border-none outline-none text-base font-normal disabled:cursor-not-allowed chat-input-field'
                    style={{
                        color: colors.text,
                        backgroundColor: colors.inputBg,
                    }}
                    aria-label='Chat message input'
                    aria-describedby={disabled ? 'streaming-status' : undefined}
                    autoComplete='off'
                />

                {/* Stop Button or Microphone Button */}
                {disabled ? (
                    <>
                        <span
                            id='streaming-status'
                            className='sr-only'
                            role='status'
                            aria-live='polite'
                        >
                            AI is generating a response
                        </span>
                        <button
                            onClick={_onStop}
                            className='flex items-center justify-center w-11 h-11 rounded-full shadow-lg transition-all shrink-0 animate-pulse'
                            style={{ backgroundColor: colors.toolContainerBg }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.buttonSecondaryHover!
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = colors.toolContainerBg!
                            }}
                            title='Stop generating'
                            aria-label='Stop generating response'
                            type='button'
                        >
                            <StopCircleIcon className='w-6 h-6' aria-hidden='true' />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={hasInput ? handleSend : handleMicrophoneClick}
                        className='flex items-center justify-center w-11 h-11 rounded-full transition-all shrink-0'
                        style={{
                            ...buttonStyle,
                            ...(isRecording
                                ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }
                                : {}),
                        }}
                        onMouseEnter={(e) => {
                            if (hasInput) {
                                e.currentTarget.style.backgroundColor = colors.buttonSecondaryHover!
                            } else if (isRecording) {
                                e.currentTarget.style.backgroundColor = colors.buttonDangerHover!
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                buttonStyle.backgroundColor || 'transparent'
                        }}
                        title={buttonTitle}
                        aria-label={buttonTitle}
                        type='button'
                    >
                        {hasInput ? (
                            <ArrowUpIcon
                                className='w-6 h-6'
                                style={{ color: colors.primary }}
                                aria-hidden='true'
                            />
                        ) : (
                            <MicIcon className='w-6 h-6' aria-hidden='true' />
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
