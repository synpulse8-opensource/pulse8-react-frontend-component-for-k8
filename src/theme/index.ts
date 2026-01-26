import type { ChatTheme } from '../types'

/**
 * Default theme with current color values
 * This theme is used when no theme is provided as props
 */
export const defaultTheme: Required<ChatTheme> = {
    colors: {
        // Primary colors
        primary: '#394253',
        primaryHover: '#2f353a',
        primaryLight: '#4C7A9A',

        // Background colors
        background: 'transparent',
        backgroundSecondary: 'rgba(0, 0, 0, 0.4)',
        backgroundTertiary: 'rgba(255, 255, 255, 0.1)',

        // Text colors
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.8)',
        textTertiary: 'rgba(255, 255, 255, 0.6)',
        textMuted: '#374151', // gray-700

        // Message colors
        userMessageText: '#ffffff',
        userMessageTextSecondary: 'rgba(255, 255, 255, 0.8)',
        userMessageBg: 'linear-gradient(to bottom right, #B476FC, #8B5CF6, #0179E9)',
        userMessageGradientFrom: '#B476FC',
        userMessageGradientVia: '#8B5CF6',
        userMessageGradientTo: '#0179E9',
        userMessageAttachmentBg: 'rgba(255, 255, 255, 0.2)',
        userMessageAttachmentBgHover: 'rgba(255, 255, 255, 0.3)',
        userMessageAttachmentBorder: 'rgba(255, 255, 255, 0.3)',
        userMessageAttachmentListBg: 'rgba(0, 0, 0, 0.2)',
        userMessageAttachmentListBorder: 'rgba(255, 255, 255, 0.2)',
        assistantMessageBg: '#2F353A', // Dark background for assistant messages
        assistantMessageAttachmentBg: '#f3f4f6', // gray-100
        assistantMessageAttachmentBgHover: '#e5e7eb', // gray-200
        assistantMessageAttachmentBorder: '#e5e7eb', // gray-200
        assistantMessageAttachmentListBg: '#f9fafb', // gray-50
        assistantMessageAttachmentListBorder: '#e5e7eb', // gray-200
        assistantMessageText: '#ffffff', // gray-700 - text color inside assistant message
        assistantMessageTextSecondary: '#6b7280', // gray-500

        // Border colors
        border: 'rgba(255, 255, 255, 0.2)',
        borderSecondary: 'rgba(255, 255, 255, 0.1)',
        borderTertiary: '#e5e7eb', // gray-200

        // Button colors
        buttonPrimary: '#394253',
        buttonPrimaryHover: '#2f353a',
        buttonSecondary: '#f3f4f6', // gray-100
        buttonSecondaryHover: '#e5e7eb', // gray-200
        buttonDanger: '#ef4444',
        buttonDangerHover: '#dc2626',
        buttonDangerBgHover: 'rgba(239, 68, 68, 0.1)',

        // Input colors
        inputBg: 'rgba(255, 255, 255, 0)',
        inputBorder: 'rgba(255, 255, 255, 0.2)',
        inputFocusBorder: '#394253',
        inputFocusRing: 'rgba(57, 66, 83, 0.2)',
        inputPlaceholder: '#9ca3af',
        inputError: '#ef4444',
        inputContainerBg: 'rgba(255, 255, 255, 0.1)',
        dragOverlayBg: 'rgba(59, 130, 246, 0.9)',
        dragOverBorderBg: 'rgba(59, 130, 246, 0.2)',
        uploadProgressBg: 'rgba(59, 130, 246, 0.1)',
        uploadProgressBorder: 'rgba(59, 130, 246, 0.2)',
        aiIconGradientFrom: '#B476FC',
        aiIconGradientTo: '#8B5CF6',
        aiIconGradientFromHover: '#A366EB',
        aiIconGradientToHover: '#7A4CD5',

        // Link colors
        link: '#186ADE',
        linkHover: '#1258B8',

        // Chart colors
        chartColors: [
            '#186ADE',
            '#E86427',
            '#4EBFB9',
            '#ED4CB7',
            '#D9A514',
            '#78BF39',
            '#1195D6',
            '#AC71F0',
        ],
        chartGridLine: '#E5ECF6',
        chartAxis: '#929292',
        chartAxisLabel: '#222222',

        // Status colors
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',

        // UI element colors
        scrollbarThumb: 'rgba(255, 255, 255, 0.2)',
        codeBlockBg: 'rgba(0, 0, 0, 0.3)',
        codeBlockBorder: 'rgba(255, 255, 255, 0.2)',
        codeInlineBg: 'rgba(255, 255, 255, 0.2)',
        tableHeaderBg: '#121a21',
        tableHeaderText: '#ffffff',
        tableRowBg: '#ffffff',
        tableRowText: '#2f353a',
        tableBorder: '#e7e8e8',
        toolContainerBg: '#f9fafb', // gray-50
        toolContainerBorder: '#e5e7eb', // gray-200
    },
}

/**
 * Merges a partial theme with the default theme
 */
export function mergeTheme(theme?: Partial<ChatTheme>): Required<ChatTheme> {
    if (!theme || !theme.colors) {
        return defaultTheme
    }

    // Only merge defined color values to avoid overwriting with undefined
    const mergedColors: Required<ChatTheme>['colors'] = { ...defaultTheme.colors }

    for (const key in theme.colors) {
        const value = theme.colors[key as keyof typeof theme.colors]
        if (value !== undefined) {
            // @ts-expect-error - TypeScript doesn't know all keys exist
            mergedColors[key as keyof typeof mergedColors] = value
        }
    }

    return {
        colors: mergedColors,
    }
}
