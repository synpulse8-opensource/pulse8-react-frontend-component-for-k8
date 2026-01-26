import type { IModelOption } from './types'

export const AI_MODELS: IModelOption[] = [
    { value: 'gpt-4.1', label: 'GPT-4.1' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
    { value: 'bedrock-claude-sonnet-4', label: 'Claude Sonnet 4 (Bedrock)' },
    { value: 'bedrock-nova-pro', label: 'Nova Pro (Bedrock)' },
]
