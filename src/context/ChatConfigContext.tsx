import React, { createContext, useContext, useMemo } from 'react'
import type { ChatTheme } from '../types'

/**
 * Stream event from the backend
 */
export interface IStreamEvent {
    type: 'llm_token' | 'tool_content' | 'tool_start' | 'tool_end' | 'error'
    content?: string
    tool_name?: string
    output?: string
    message?: string
    title?: string
    input?: string
}

/**
 * Configuration for the chat package
 * All options are optional - sensible defaults are provided
 */
export interface IChatConfig {
    /**
     * Event adapter to transform backend events to IStreamEvent
     * Use this if your backend has a different event format
     * @param rawEvent - The raw event from your backend
     * @returns IStreamEvent or null if the event should be ignored
     */
    eventAdapter?: (rawEvent: unknown) => IStreamEvent | null

    /**
     * Custom icons for the chat UI
     */
    icons?: {
        assistant?: React.ComponentType<React.SVGProps<SVGSVGElement>>
        stop?: React.ComponentType<React.SVGProps<SVGSVGElement>>
        mic?: React.ComponentType<React.SVGProps<SVGSVGElement>>
    }

    /**
     * Theme customization
     */
    theme?: Partial<ChatTheme>
}

/**
 * Default event adapter that expects events in the standard format
 * Use this as a reference when implementing your own adapter
 */
export const defaultEventAdapter = (event: unknown): IStreamEvent | null => {
    if (typeof event !== 'object' || event === null) return null
    const e = event as Record<string, unknown>
    if (!e.type) return null
    return {
        type: e.type as IStreamEvent['type'],
        content: e.content as string | undefined,
        tool_name: e.tool_name as string | undefined,
        output: e.output as string | undefined,
        message: e.message as string | undefined,
        title: e.title as string | undefined,
        input: e.input as string | undefined,
    }
}

/**
 * Default configuration values
 */
const defaultConfig: IChatConfig = {
    eventAdapter: defaultEventAdapter,
    icons: {},
    theme: {},
}

/**
 * Internal context value with resolved defaults
 */
interface IChatConfigContextValue {
    config: Required<IChatConfig>
}

const ChatConfigContext = createContext<IChatConfigContextValue | null>(null)

export interface IChatConfigProviderProps {
    config?: IChatConfig
    children: React.ReactNode
}

/**
 * Provider component for chat configuration
 * Wrap your chat components with this to provide custom configuration
 *
 * @example
 * ```tsx
 * <ChatConfigProvider config={{
 *   eventAdapter: myCustomAdapter,
 *   icons: { assistant: MyCustomIcon },
 * }}>
 *   <ChatPanel {...props} />
 * </ChatConfigProvider>
 * ```
 */
export const ChatConfigProvider: React.FC<IChatConfigProviderProps> = ({
    config = {},
    children,
}) => {
    const mergedConfig = useMemo<Required<IChatConfig>>(
        () => ({
            eventAdapter: config.eventAdapter ?? defaultConfig.eventAdapter!,
            icons: config.icons ?? defaultConfig.icons!,
            theme: config.theme ?? defaultConfig.theme!,
        }),
        [config],
    )

    const value = useMemo<IChatConfigContextValue>(() => ({ config: mergedConfig }), [mergedConfig])

    return <ChatConfigContext.Provider value={value}>{children}</ChatConfigContext.Provider>
}

/**
 * Hook to access the chat configuration
 * Returns the merged configuration with defaults applied
 *
 * @example
 * ```tsx
 * const { config } = useChatConfig()
 * const AssistantIcon = config.icons.assistant
 * ```
 */
export const useChatConfig = (): IChatConfigContextValue => {
    const context = useContext(ChatConfigContext)
    if (!context) {
        // Return default config if used outside provider
        return { config: defaultConfig as Required<IChatConfig> }
    }
    return context
}
