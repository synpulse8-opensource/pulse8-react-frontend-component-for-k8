import React, { useEffect, useRef } from 'react'
import { Message } from '../Message'
import type { IChatContainerProps } from './types'
import { mergeTheme } from '../../theme'

export const ChatContainer: React.FC<IChatContainerProps> = ({
    messages,
    isStreaming = false,
    onSuggestedQuestionClick,
    theme,
    emptyStateTitle,
}) => {
    const fullTheme = mergeTheme(theme)
    const colors = fullTheme.colors
    const containerRef = useRef<HTMLDivElement>(null)
    const prevMessageCountRef = useRef(messages.length)
    const isUserNearBottomRef = useRef(true)

    // Track user scroll behavior
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleScroll = () => {
            const isAtBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight < 100
            isUserNearBottomRef.current = isAtBottom
        }

        container.addEventListener('scroll', handleScroll, { passive: true })
        return () => container.removeEventListener('scroll', handleScroll)
    }, [])

    // Handle auto-scroll on message changes
    useEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const messageCountChanged = prevMessageCountRef.current !== messages.length

        // Only auto-scroll if user is near bottom OR if new messages were added
        if (isUserNearBottomRef.current || messageCountChanged) {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: messageCountChanged ? 'smooth' : 'auto',
                })
            })
        }

        prevMessageCountRef.current = messages.length
    }, [messages])

    return (
        <div
            ref={containerRef}
            role='log'
            aria-live='polite'
            aria-label='Chat conversation'
            aria-relevant='additions'
            className='h-full overflow-y-auto px-2 md:px-4 pt-2 md:pt-4 scrollbar-thin'
            style={
                {
                    paddingBottom: 'calc(140px + env(safe-area-inset-bottom, 0px))',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                    '--scrollbar-thumb': colors.scrollbarThumb,
                } as React.CSSProperties & { '--scrollbar-thumb': string }
            }
            tabIndex={0}
        >
            {messages.length === 0 ? (
                <div
                    className='h-full flex items-center justify-center text-center'
                    style={{ color: colors.textTertiary }}
                    role='status'
                    aria-label='Empty chat state'
                >
                    <div>
                        <p className='text-lg' style={{ color: colors.textTertiary }}>
                            {emptyStateTitle ||
                                'Start a conversation. Type a message below to begin'}
                        </p>
                    </div>
                </div>
            ) : (
                <div role='list' aria-label='Messages'>
                    {messages.map((message, index) => {
                        const nextMessage = messages[index + 1]
                        const hasReply =
                            message.role === 'user' && nextMessage?.role === 'assistant'
                        const isLatest = index === messages.length - 1
                        return (
                            <Message
                                key={message.id}
                                message={message}
                                hasReply={hasReply}
                                isLatest={isLatest}
                                isStreaming={isStreaming}
                                messages={messages}
                                onSuggestedQuestionClick={onSuggestedQuestionClick}
                                theme={theme}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export type { IChatContainerProps } from './types'
