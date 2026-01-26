import React from 'react'
import type { IMessageProps } from './types'
import { UserMessage } from '../UserMessage'
import { AssistantMessage } from '../AssistantMessage'

export const Message: React.FC<IMessageProps> = ({
    message,
    hasReply = false,
    isLatest = false,
    isStreaming = false,
    messages,
    onSuggestedQuestionClick: _onSuggestedQuestionClick,
    theme,
}) => {
    const ariaLabel =
        message.role === 'user'
            ? `Your message: ${message.content.slice(0, 100)}${message.content.length > 100 ? '...' : ''}`
            : `Assistant response`

    if (message.role === 'user') {
        return (
            <article role='listitem' aria-label={ariaLabel}>
                <UserMessage message={message} hasReply={hasReply} theme={theme} />
            </article>
        )
    }

    return (
        <article role='listitem' aria-label={ariaLabel} aria-busy={isStreaming && isLatest}>
            <AssistantMessage
                message={message}
                isStreaming={isStreaming}
                isLatestMessage={isLatest}
                messages={messages}
                theme={theme}
            />
            {/* {isLatest && !hasReply && !isStreaming && onSuggestedQuestionClick && (
                <SuggestedQuestions onQuestionClick={onSuggestedQuestionClick} theme={theme} />
            )} */}
        </article>
    )
}

export type { IMessageProps } from './types'
