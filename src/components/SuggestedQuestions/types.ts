import type { ChatTheme } from '../../types'

export interface ISuggestedQuestionsProps {
    onQuestionClick: (question: string) => void
    theme?: Partial<ChatTheme>
}
