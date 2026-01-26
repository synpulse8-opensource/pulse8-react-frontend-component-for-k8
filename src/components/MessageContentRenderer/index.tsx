import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { IContentSegment, ChatTheme } from '../../types'
import { markdownComponents } from '../markdownComponents'
import type { IMessage } from '../../types'
import type { IMessageContentRendererProps } from './types'
import { MessageErrorBoundary } from '../ErrorBoundary'

/**
 * Normalizes a message to always have contentSegments.
 * If contentSegments doesn't exist, generates it from content.
 */
const normalizeMessageToSegments = (message: IMessage): IContentSegment[] => {
    // If contentSegments already exists, filter to text only
    if (message.contentSegments && message.contentSegments.length > 0) {
        return message.contentSegments.filter((segment) => segment.type === 'text')
    }

    // Generate contentSegments from content
    const segments: IContentSegment[] = []

    // Add text content as a text segment if it exists
    if (message.content && message.content.trim()) {
        segments.push({
            type: 'text',
            content: message.content,
        })
    }

    return segments
}

/**
 * Preprocesses content to convert HTML <br> tags to markdown line breaks
 */
const preprocessContent = (content: string): string => {
    // Convert <br> and <br/> tags to double newlines (markdown paragraph break)
    return content.replace(/<br\s*\/?>/gi, '\n\n')
}

/**
 * Renders a text segment as markdown
 */
const renderTextSegment = (
    content: string,
    segmentIndex: number,
    theme?: Partial<ChatTheme>,
): React.ReactNode => {
    if (!content.trim()) {
        return null
    }

    try {
        const processedContent = preprocessContent(content)
        return (
            <div
                key={`text-${segmentIndex}`}
                className='leading-relaxed max-w-none text-sm md:text-base'
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents(theme, 'assistant')}
                >
                    {processedContent}
                </ReactMarkdown>
            </div>
        )
    } catch (error) {
        console.warn('Markdown parsing failed, using plain text:', error)
        return (
            <div key={`text-${segmentIndex}`} className='whitespace-pre-wrap wrap-break-word'>
                {content}
            </div>
        )
    }
}

export const MessageContentRenderer: React.FC<IMessageContentRendererProps> = ({
    message,
    theme,
}) => {
    const segments = normalizeMessageToSegments(message)

    // If no segments to render, return null
    if (segments.length === 0) {
        return null
    }

    return (
        <MessageErrorBoundary messageId={message.id}>
            {segments.map((segment, segmentIndex) => {
                if (segment.type === 'text') {
                    return renderTextSegment(segment.content, segmentIndex, theme)
                }
                return null
            })}
        </MessageErrorBoundary>
    )
}

export type { IMessageContentRendererProps } from './types'
