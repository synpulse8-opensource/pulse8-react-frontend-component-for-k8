import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronDownIcon, ChevronUpIcon, DocumentIcon } from '@heroicons/react/24/outline'
import type { IUserMessageProps } from './types'
import { markdownComponents } from '../markdownComponents'
import { mergeTheme } from '../../theme'
import { ChecksIcon } from '../../assets'

export const UserMessage: React.FC<IUserMessageProps> = ({ message, hasReply = false, theme }) => {
    const [showPdfs, setShowPdfs] = useState(false)
    const fullTheme = mergeTheme(theme)
    const colors = fullTheme.colors

    return (
        <div className='relative mb-3 md:mb-4 ml-auto w-fit max-w-[90%] md:max-w-[85%]'>
            <div className='flex justify-end'>
                <div
                    className='px-4 py-2.5 md:px-5 md:py-3 shadow-lg rounded-xl rounded-tr-none rounded-br-xl'
                    style={{
                        background: `linear-gradient(to bottom right, ${colors.userMessageGradientFrom}, ${colors.userMessageGradientVia}, ${colors.userMessageGradientTo})`,
                    }}
                >
                    {/* Message Content */}
                    <div
                        className='leading-relaxed max-w-none text-sm md:text-base'
                        style={{ color: colors.userMessageText }}
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents(theme, 'user')}
                        >
                            {message.content.replace(/<br\s*\/?>/gi, '\n\n')}
                        </ReactMarkdown>
                        <div className='flex justify-end items-center gap-1 mt-2'>
                            <div
                                className='text-xs'
                                style={{ color: colors.userMessageTextSecondary }}
                            >
                                {message.timestamp.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                })}
                            </div>
                            {hasReply && (
                                <ChecksIcon
                                    className='w-3 h-3 animate-fade-in'
                                    style={{ color: colors.userMessageTextSecondary }}
                                />
                            )}
                        </div>
                    </div>

                    {/* PDF Attachments */}
                    {message.attachedFiles && message.attachedFiles.length > 0 && (
                        <div className='mt-4'>
                            <button
                                onClick={() => setShowPdfs(!showPdfs)}
                                className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all border'
                                style={{
                                    backgroundColor: colors.userMessageAttachmentBg,
                                    borderColor: colors.userMessageAttachmentBorder,
                                    color: colors.userMessageText,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        colors.userMessageAttachmentBgHover!
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        colors.userMessageAttachmentBg!
                                }}
                            >
                                <DocumentIcon
                                    className='w-4 h-4'
                                    style={{ color: colors.userMessageText }}
                                />
                                <span>Attached PDF files: {message.attachedFiles.length}</span>
                                {showPdfs ? (
                                    <ChevronUpIcon
                                        className='w-4 h-4 ml-auto'
                                        style={{ color: colors.userMessageText }}
                                    />
                                ) : (
                                    <ChevronDownIcon
                                        className='w-4 h-4 ml-auto'
                                        style={{ color: colors.userMessageText }}
                                    />
                                )}
                            </button>
                            {showPdfs && (
                                <div
                                    className='mt-2 p-3 rounded-lg space-y-1 border'
                                    style={{
                                        backgroundColor: colors.userMessageAttachmentListBg,
                                        borderColor: colors.userMessageAttachmentListBorder,
                                    }}
                                >
                                    {message.attachedFiles.map((file) => (
                                        <div
                                            key={file.uuid}
                                            className='flex items-center gap-2 text-sm'
                                            style={{ color: colors.userMessageText }}
                                        >
                                            <DocumentIcon
                                                className='w-4 h-4 shrink-0'
                                                style={{ color: colors.userMessageText }}
                                            />
                                            {file.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export type { IUserMessageProps } from './types'
