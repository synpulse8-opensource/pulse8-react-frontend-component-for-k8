import React from 'react'
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import type { ISuggestedQuestionsProps } from './types'
import { mergeTheme } from '../../theme'

// Mock suggested questions - will be replaced with dynamic data later
const MOCK_SUGGESTIONS = [
    'Can you provide more detail on Avaloq Implementation?',
    "Explain Synpulse's approach to wealth management.",
    'What specific regulations does Synpulse address?',
] as const

export const SuggestedQuestions: React.FC<ISuggestedQuestionsProps> = ({
    onQuestionClick,
    theme,
}) => {
    const fullTheme = mergeTheme(theme)
    const colors = fullTheme.colors

    return (
        <div className='mb-4 space-y-2 max-w-[85%]'>
            {MOCK_SUGGESTIONS.map((question, index) => (
                <button
                    key={index}
                    onClick={() => onQuestionClick(question)}
                    className='flex items-center gap-3 w-full px-4 py-3 shadow-md rounded-xl border transition-all text-left group'
                    style={{
                        backgroundColor: colors.toolContainerBg,
                        borderColor: colors.borderTertiary,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.buttonSecondary!
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.toolContainerBg!
                    }}
                >
                    <SparklesIcon className='w-5 h-5 shrink-0' style={{ color: colors.info }} />
                    <span className='flex-1 text-sm' style={{ color: colors.textMuted }}>
                        {question}
                    </span>
                    <ArrowRightIcon
                        className='w-5 h-5 shrink-0 transition-colors'
                        style={{ color: colors.textTertiary }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.textMuted!
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.textTertiary!
                        }}
                    />
                </button>
            ))}
        </div>
    )
}

export type { ISuggestedQuestionsProps } from './types'
