import React, { useState, useRef, useEffect } from 'react'
import type { IModelOption } from '../../../hooks/useModelSelection'
import type { ChatTheme } from '../../../types'
import { mergeTheme } from '../../../theme'

export interface IModelSelectorProps {
    availableModels: IModelOption[]
    selectedModel: string
    onModelChange: (modelId: string) => void
    disabled?: boolean
    theme?: Partial<ChatTheme>
}

export const ModelSelector: React.FC<IModelSelectorProps> = ({
    availableModels,
    selectedModel,
    onModelChange,
    disabled = false,
    theme,
}) => {
    const fullTheme = mergeTheme(theme)
    const colors = fullTheme.colors
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showDropdown])

    const handleModelSelect = (modelId: string) => {
        onModelChange(modelId)
        setShowDropdown(false)
    }

    const selectedModelInfo = availableModels.find((m) => m.id === selectedModel)

    return (
        <div className='relative' ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={disabled}
                className='flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-all disabled:opacity-50'
                style={{
                    backgroundColor: colors.backgroundTertiary,
                    borderColor: colors.borderSecondary,
                }}
                onMouseEnter={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.backgroundColor = colors.backgroundSecondary!
                        e.currentTarget.style.borderColor = colors.border!
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.backgroundColor = colors.backgroundTertiary!
                        e.currentTarget.style.borderColor = colors.borderSecondary!
                    }
                }}
            >
                <svg
                    className='w-4 h-4 shrink-0'
                    style={{ color: colors.textTertiary }}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                </svg>
                <span className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                    {selectedModelInfo?.name || selectedModel}
                </span>
                <svg
                    className='w-4 h-4 shrink-0'
                    style={{
                        color: colors.textTertiary,
                        transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                    }}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                    />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div
                    className='absolute bottom-full right-0 mb-2 w-72 rounded-lg shadow-xl border py-2 z-50'
                    style={{
                        backgroundColor: colors.toolContainerBg,
                        borderColor: colors.toolContainerBorder,
                    }}
                >
                    <div
                        className='px-4 py-2 border-b'
                        style={{ borderColor: colors.toolContainerBorder }}
                    >
                        <h3 className='text-sm font-semibold' style={{ color: colors.textMuted }}>
                            Select Model
                        </h3>
                    </div>
                    <div className='max-h-80 overflow-y-auto'>
                        {availableModels.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => handleModelSelect(model.id)}
                                className='w-full px-4 py-3 text-left transition-colors flex items-start gap-3'
                                style={{ color: colors.textMuted }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.buttonSecondary!
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                            >
                                <div className='shrink-0 mt-0.5'>
                                    {selectedModel === model.id ? (
                                        <svg
                                            className='w-5 h-5'
                                            style={{ color: colors.info }}
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M5 13l4 4L19 7'
                                            />
                                        </svg>
                                    ) : (
                                        <div className='w-5 h-5' />
                                    )}
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <div
                                        className='text-sm font-medium'
                                        style={{ color: colors.textMuted }}
                                    >
                                        {model.name}
                                    </div>
                                    {model.description && (
                                        <div
                                            className='text-xs mt-0.5'
                                            style={{
                                                color: colors.textTertiary,
                                            }}
                                        >
                                            {model.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
