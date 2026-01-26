import type { ChatTheme } from './index'

/**
 * Generic chart data format
 * Users can use this as a reference when implementing custom chart renderers.
 *
 * This interface is intentionally flexible to support various chart libraries
 * (ECharts, Chart.js, Plotly, Recharts, etc.)
 */
export interface IChartData {
    /** Chart type identifier */
    type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | string

    /** Chart title */
    title?: string

    /** Simple data format - array of label/value pairs */
    data?: Array<{
        label: string
        value: number
        [key: string]: unknown
    }>

    /** X-axis configuration */
    xAxis?: {
        label?: string
        data?: Array<string | number>
        type?: 'category' | 'value' | 'time'
    }

    /** Y-axis configuration */
    yAxis?: {
        label?: string
        min?: number
        max?: number
        type?: 'value' | 'category'
    }

    /** Multiple series for multi-line/bar charts */
    series?: Array<{
        name?: string
        data: Array<number | { x: number | string; y: number }>
        type?: string
        color?: string
    }>

    /** Additional chart-specific options */
    options?: Record<string, unknown>
}

/**
 * Props for custom chart renderer components
 *
 * @example
 * ```tsx
 * import type { IChartRendererProps, IChartData } from '@pulse8-ai/chat'
 *
 * const MyEChartsRenderer: React.FC<IChartRendererProps> = ({ data, theme }) => {
 *   const option = convertToEChartsOption(data)
 *   return <ReactECharts option={option} />
 * }
 * ```
 */
export interface IChartRendererProps {
    /** Parsed chart data */
    data: IChartData

    /** Theme for consistent styling */
    theme?: Partial<ChatTheme>
}

/**
 * Helper type for chart series data
 */
export interface IChartSeriesData {
    name?: string
    data: number[]
    color?: string
}

/**
 * Helper to convert raw tool output to IChartData
 * Users can use this as a starting point and customize as needed
 *
 * @param output - Raw JSON string from tool output
 * @returns Parsed chart data or null if invalid
 */
export const parseChartData = (output: string): IChartData | null => {
    try {
        const parsed = JSON.parse(output)

        // Handle different possible formats
        if (parsed.type && (parsed.data || parsed.series)) {
            return parsed as IChartData
        }

        // Handle Plotly-style format
        if (parsed.data && Array.isArray(parsed.data)) {
            const trace = parsed.data[0]
            if (trace) {
                return {
                    type: trace.type || 'line',
                    title: parsed.layout?.title?.text || parsed.layout?.title,
                    xAxis: {
                        data: trace.x,
                        label: parsed.layout?.xaxis?.title,
                    },
                    series: [
                        {
                            name: trace.name,
                            data: trace.y,
                        },
                    ],
                }
            }
        }

        // Return as-is if it has some chart-like structure
        return {
            type: 'unknown',
            options: parsed,
        }
    } catch {
        return null
    }
}
