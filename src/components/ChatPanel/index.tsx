import React from 'react'
import { ChatContainer } from '../ChatContainer'
import { ChatInput } from '../ChatInput'
import type { IChatPanelProps } from './types'
import { clsx } from 'clsx'

export const ChatPanel: React.FC<IChatPanelProps> = ({
    className,
    messages,
    isStreaming,
    onSendMessage,
    onStopStreaming,
    uploadedPdfs = [],
    onUploadPdf,
    onRemovePdf,
    onClearChat,
    theme,
    emptyStateTitle,
    availableModels,
    selectedModel,
    onModelChange,
}) => {
    return (
        <div className={clsx('h-full flex flex-col relative', className)}>
            {/* Messages Area - takes all available space */}
            <div className='flex-1 overflow-hidden min-h-0'>
                <ChatContainer
                    messages={messages}
                    isStreaming={isStreaming}
                    onSuggestedQuestionClick={onSendMessage}
                    theme={theme}
                    emptyStateTitle={emptyStateTitle}
                />
            </div>

            {/* Input Area - Fixed/Floating at bottom */}
            <div
                className='w-full bg-transparent px-6 z-50 absolute bottom-0'
                style={{
                    paddingTop: '1.25rem',
                    paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
                }}
            >
                <ChatInput
                    onSend={onSendMessage}
                    onStop={onStopStreaming}
                    disabled={isStreaming}
                    uploadedPdfs={uploadedPdfs}
                    onUploadPdf={onUploadPdf}
                    onRemovePdf={onRemovePdf}
                    onClearChat={onClearChat}
                    theme={theme}
                    availableModels={availableModels}
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                />
            </div>
        </div>
    )
}

export type { IChatPanelProps } from './types'
