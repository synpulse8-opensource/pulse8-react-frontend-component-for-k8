import { useState, useCallback } from 'react'

/**
 * Represents an AI model option for selection.
 */
export interface IModelOption {
    /** Unique identifier for the model (e.g., 'gpt-4', 'claude-3') */
    id: string
    /** Human-readable display name */
    name: string
    /** Optional description of the model's capabilities */
    description?: string
}

/**
 * Configuration options for the useModelSelection hook.
 */
export interface IUseModelSelectionOptions {
    /**
     * Initial selected model ID.
     * If not provided, defaults to the first model in the models array.
     */
    initialModel?: string
    /**
     * Available models to choose from.
     * Each model should have a unique `id` property.
     */
    models?: IModelOption[]
}

/**
 * Hook to manage AI model selection
 *
 * @example
 * ```tsx
 * const { selectedModel, setSelectedModel, availableModels } = useModelSelection({
 *   initialModel: 'gpt-4',
 *   models: [
 *     { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI flagship' },
 *     { id: 'claude-3', name: 'Claude 3', description: 'Anthropic latest' },
 *   ],
 * })
 * ```
 */
export function useModelSelection(options: IUseModelSelectionOptions = {}) {
    const { initialModel, models = [] } = options

    // Default to first model if no initial model specified
    const defaultModel = initialModel ?? models[0]?.id ?? ''

    const [selectedModel, setSelectedModel] = useState<string>(defaultModel)

    const changeModel = useCallback((modelId: string) => {
        setSelectedModel(modelId)
    }, [])

    const getSelectedModelInfo = useCallback(() => {
        return models.find((m) => m.id === selectedModel)
    }, [models, selectedModel])

    return {
        selectedModel,
        setSelectedModel: changeModel,
        availableModels: models,
        getSelectedModelInfo,
    }
}
