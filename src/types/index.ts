// Chat Types
export type MessageRole = 'user' | 'assistant'

// Chart Types (for custom implementations)
export type { IChartData, IChartRendererProps, IChartSeriesData } from './chart'
export { parseChartData } from './chart'

export type ContentSegmentType = 'text' | 'tool'

export interface ITextSegment {
    type: 'text'
    content: string
}

export interface IToolSegment {
    type: 'tool'
    toolIndex: number
}

export type IContentSegment = ITextSegment | IToolSegment

export interface IPdfFile {
    uuid: string
    name: string
}

export interface IMessage {
    id: string
    role: MessageRole
    content: string
    attachedFiles?: IPdfFile[]
    toolOutputs?: IToolOutput[]
    contentSegments?: IContentSegment[] // Ordered segments preserving streaming order
    timestamp: Date
}

export interface IToolOutput {
    toolName: string
    friendlyName: string
    output: string
    visible: boolean
    title?: string
}

// Theme Types
export interface ChatTheme {
    colors: {
        // Primary colors
        primary?: string
        primaryHover?: string
        primaryLight?: string

        // Background colors
        background?: string
        backgroundSecondary?: string
        backgroundTertiary?: string

        // Text colors
        text?: string
        textSecondary?: string
        textTertiary?: string
        textMuted?: string

        // Message colors
        userMessageText?: string
        userMessageTextSecondary?: string
        userMessageBg?: string
        userMessageGradientFrom?: string
        userMessageGradientVia?: string
        userMessageGradientTo?: string
        userMessageAttachmentBg?: string
        userMessageAttachmentBgHover?: string
        userMessageAttachmentBorder?: string
        userMessageAttachmentListBg?: string
        userMessageAttachmentListBorder?: string
        assistantMessageBg?: string
        assistantMessageAttachmentBg?: string
        assistantMessageAttachmentBgHover?: string
        assistantMessageAttachmentBorder?: string
        assistantMessageAttachmentListBg?: string
        assistantMessageAttachmentListBorder?: string
        assistantMessageText?: string
        assistantMessageTextSecondary?: string

        // Border colors
        border?: string
        borderSecondary?: string
        borderTertiary?: string

        // Button colors
        buttonPrimary?: string
        buttonPrimaryHover?: string
        buttonSecondary?: string
        buttonSecondaryHover?: string
        buttonDanger?: string
        buttonDangerHover?: string
        buttonDangerBgHover?: string

        // Input colors
        inputBg?: string
        inputBorder?: string
        inputFocusBorder?: string
        inputFocusRing?: string
        inputPlaceholder?: string
        inputError?: string
        inputContainerBg?: string
        dragOverlayBg?: string
        dragOverBorderBg?: string
        uploadProgressBg?: string
        uploadProgressBorder?: string
        aiIconGradientFrom?: string
        aiIconGradientTo?: string
        aiIconGradientFromHover?: string
        aiIconGradientToHover?: string

        // Link colors
        link?: string
        linkHover?: string

        // Chart colors
        chartColors?: string[]
        chartGridLine?: string
        chartAxis?: string
        chartAxisLabel?: string

        // Status colors
        success?: string
        error?: string
        warning?: string
        info?: string

        // UI element colors
        scrollbarThumb?: string
        codeBlockBg?: string
        codeBlockBorder?: string
        codeInlineBg?: string
        tableHeaderBg?: string
        tableHeaderText?: string
        tableRowBg?: string
        tableRowText?: string
        tableBorder?: string
        toolContainerBg?: string
        toolContainerBorder?: string
    }
}
