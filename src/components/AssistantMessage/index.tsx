import React, { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon, ChevronUpIcon, DocumentIcon } from '@heroicons/react/24/outline'
import type { IAssistantMessageProps } from './types'
import { MessageContentRenderer } from '../MessageContentRenderer'
import { mergeTheme } from '../../theme'
import { ChecksIcon } from '../../assets'

export const AssistantMessage: React.FC<IAssistantMessageProps> = ({
    message,
    isStreaming = false,
    isLatestMessage: isLatestMessageProp,
    messages,
    theme,
}) => {
    const fullTheme = mergeTheme(theme)
    const colors = fullTheme.colors
    const [showPdfs, setShowPdfs] = useState(false)

    // Determine if this is the latest message
    const isLatestMessage =
        isLatestMessageProp !== undefined
            ? isLatestMessageProp
            : messages && messages.length > 0 && messages[messages.length - 1].id === message.id

    const lastContentUpdateRef = useRef<string>(message.content)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [showBottomLoading, setShowBottomLoading] = useState(false)

    // Show loading at top only for the latest message when streaming and no content yet
    const showTopLoading = isStreaming && isLatestMessage && !message.content.trim()

    // Track when content stops updating during streaming
    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }

        // Don't show loading if not the latest message, not streaming, or no content
        if (!isLatestMessage || !isStreaming || !message.content.trim()) {
            setShowBottomLoading(false)
            lastContentUpdateRef.current = message.content
            return
        }

        // Check if content has changed
        const contentChanged = message.content !== lastContentUpdateRef.current

        if (contentChanged) {
            // Content updated, reset the ref and hide loading
            lastContentUpdateRef.current = message.content
            setShowBottomLoading(false)
        }

        // Set a timeout to show loading if content doesn't update for 1.5 seconds
        timeoutRef.current = setTimeout(() => {
            // Double-check conditions before showing loading
            const stillLatest =
                messages && messages.length > 0 && messages[messages.length - 1].id === message.id
            if (isStreaming && stillLatest && message.content.trim()) {
                setShowBottomLoading(true)
            }
        }, 1500) // 1.5 seconds of no updates

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
        }
    }, [message.content, message.id, isStreaming, isLatestMessage, messages])

    // Handle assistantMessageBg - if it's a Tailwind class, use it; otherwise use as style
    const assistantBgStyle = colors.assistantMessageBg?.startsWith('bg-')
        ? undefined
        : { backgroundColor: colors.assistantMessageBg }
    const assistantBgClass = colors.assistantMessageBg?.startsWith('bg-')
        ? colors.assistantMessageBg
        : ''

    return (
        <div
            className={`relative mb-3 md:mb-4 px-4 py-2.5 md:px-5 md:py-3 mr-auto w-fit max-w-[90%] md:max-w-[85%] shadow-md rounded-xl rounded-tl-none rounded-bl-xl ${assistantBgClass}`}
            style={assistantBgStyle}
        >
            {/* Message Content */}
            <div
                className='leading-relaxed max-w-none'
                style={{ color: colors.assistantMessageText }}
            >
                {showTopLoading ? (
                    <div className='flex items-center gap-1.5 py-2'>
                        <div
                            className='w-1 h-1 rounded-full animate-bounce-typing'
                            style={{ backgroundColor: colors.assistantMessageText }}
                        ></div>
                        <div
                            className='w-1 h-1 rounded-full animate-bounce-typing-delay-1'
                            style={{ backgroundColor: colors.assistantMessageText }}
                        ></div>
                        <div
                            className='w-1 h-1 rounded-full animate-bounce-typing-delay-2'
                            style={{ backgroundColor: colors.assistantMessageText }}
                        ></div>
                    </div>
                ) : (
                    <>
                        <MessageContentRenderer message={message} theme={theme} />
                        {/* Loading dots at bottom when streaming with existing content */}
                        {showBottomLoading && (
                            <div className='flex items-center gap-1.5 py-2 mt-2'>
                                <div
                                    className='w-1 h-1 rounded-full animate-bounce-typing'
                                    style={{ backgroundColor: colors.assistantMessageText }}
                                ></div>
                                <div
                                    className='w-1 h-1 rounded-full animate-bounce-typing-delay-1'
                                    style={{ backgroundColor: colors.assistantMessageText }}
                                ></div>
                                <div
                                    className='w-1 h-1 rounded-full animate-bounce-typing-delay-2'
                                    style={{ backgroundColor: colors.assistantMessageText }}
                                ></div>
                            </div>
                        )}
                        {/* Timestamp and check icon */}
                        {message.content.trim() && !showBottomLoading && (
                            <div className='flex justify-end items-center gap-1 mt-2'>
                                <div
                                    className='text-xs'
                                    style={{ color: colors.assistantMessageTextSecondary }}
                                >
                                    {message.timestamp.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    })}
                                </div>
                                <ChecksIcon
                                    className='w-3 h-3 animate-fade-in'
                                    style={{ color: colors.assistantMessageTextSecondary }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* PDF Attachments */}
            {message.attachedFiles && message.attachedFiles.length > 0 && (
                <div className='mt-4'>
                    <button
                        onClick={() => setShowPdfs(!showPdfs)}
                        className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all border'
                        style={{
                            backgroundColor: colors.assistantMessageAttachmentBg,
                            borderColor: colors.assistantMessageAttachmentBorder,
                            color: colors.assistantMessageText,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                colors.assistantMessageAttachmentBgHover!
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                colors.assistantMessageAttachmentBg!
                        }}
                    >
                        <DocumentIcon
                            className='w-4 h-4'
                            style={{ color: colors.assistantMessageText }}
                        />
                        <span>Attached PDF files: {message.attachedFiles.length}</span>
                        {showPdfs ? (
                            <ChevronUpIcon
                                className='w-4 h-4 ml-auto'
                                style={{ color: colors.assistantMessageText }}
                            />
                        ) : (
                            <ChevronDownIcon
                                className='w-4 h-4 ml-auto'
                                style={{ color: colors.assistantMessageText }}
                            />
                        )}
                    </button>
                    {showPdfs && (
                        <div
                            className='mt-2 p-3 rounded-xl space-y-1 border'
                            style={{
                                backgroundColor: colors.assistantMessageAttachmentListBg,
                                borderColor: colors.assistantMessageAttachmentListBorder,
                            }}
                        >
                            {message.attachedFiles.map((file) => (
                                <div
                                    key={file.uuid}
                                    className='flex items-center gap-2 text-sm'
                                    style={{ color: colors.assistantMessageText }}
                                >
                                    <DocumentIcon
                                        className='w-4 h-4 shrink-0'
                                        style={{ color: colors.info }}
                                    />
                                    {file.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export type { IAssistantMessageProps } from './types'
