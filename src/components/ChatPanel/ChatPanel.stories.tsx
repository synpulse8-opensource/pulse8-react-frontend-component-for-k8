import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ChatPanel } from './index'
import { ChatConfigProvider } from '../../context/ChatConfigContext'
import { useChatMessages } from '../../hooks/useChatMessages'
import { useState, useCallback } from 'react'
import type { IMessage, ChatTheme } from '../../types'
import type { IStreamEvent, IChatConfig } from '../../context/ChatConfigContext'

// =============================================================================
// Mock Services for Different Backend Scenarios
// =============================================================================

// Standard event format mock
const mockStandardBackend = {
    async sendMessage(
        _request: { user_input: string; model_name: string },
        onEvent: (event: IStreamEvent) => void,
        onComplete: () => void,
        _onError: (error: Error) => void,
        abortSignal?: AbortSignal,
    ) {
        const words = ['Hello', '!', ' How', ' can', ' I', ' help', ' you', ' today', '?']

        for (const word of words) {
            if (abortSignal?.aborted) break
            await new Promise((resolve) => setTimeout(resolve, 100))
            onEvent({ type: 'llm_token', content: word })
        }

        onComplete()
    },
}

// OpenAI-style streaming format mock
const mockOpenAIBackend = {
    async sendMessage(
        _request: { user_input: string },
        onRawEvent: (event: unknown) => void,
        onComplete: () => void,
        _onError: (error: Error) => void,
        abortSignal?: AbortSignal,
    ) {
        // Simulates OpenAI's delta format
        const words = ["I'm", ' a', ' chatbot', ' using', ' OpenAI-style', ' streaming', '!']

        for (const word of words) {
            if (abortSignal?.aborted) break
            await new Promise((resolve) => setTimeout(resolve, 100))
            // OpenAI format: choices[0].delta.content
            onRawEvent({
                choices: [{ delta: { content: word } }],
            })
        }

        onComplete()
    },
}

// Anthropic-style streaming format mock
const mockAnthropicBackend = {
    async sendMessage(
        _request: { user_input: string },
        onRawEvent: (event: unknown) => void,
        onComplete: () => void,
        _onError: (error: Error) => void,
        abortSignal?: AbortSignal,
    ) {
        // Simulates Anthropic's event format
        const words = ['Hello', '!', " I'm", ' using', ' Anthropic-style', ' events', '.']

        for (const word of words) {
            if (abortSignal?.aborted) break
            await new Promise((resolve) => setTimeout(resolve, 100))
            // Anthropic format: type: content_block_delta, delta: { text: ... }
            onRawEvent({
                type: 'content_block_delta',
                delta: { text: word },
            })
        }

        onComplete()
    },
}

// =============================================================================
// Event Adapters for Different Backends
// =============================================================================

// OpenAI event adapter
const openAIEventAdapter = (rawEvent: unknown): IStreamEvent | null => {
    const event = rawEvent as { choices?: Array<{ delta?: { content?: string } }> }
    if (event.choices?.[0]?.delta?.content) {
        return {
            type: 'llm_token',
            content: event.choices[0].delta.content,
        }
    }
    return null
}

// Anthropic event adapter
const anthropicEventAdapter = (rawEvent: unknown): IStreamEvent | null => {
    const event = rawEvent as { type?: string; delta?: { text?: string } }
    if (event.type === 'content_block_delta' && event.delta?.text) {
        return {
            type: 'llm_token',
            content: event.delta.text,
        }
    }
    return null
}

// =============================================================================
// Story Wrapper Components
// =============================================================================

const meta: Meta<typeof ChatPanel> = {
    title: 'Components/ChatPanel',
    component: ChatPanel,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
The ChatPanel component is the main chat interface. It can be customized with:
- **ChatConfigProvider** for event adapters and icons
- **Theme** for visual customization
- **Event adapters** for different backend formats
                `,
            },
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ChatPanel>

// Default story - basic usage
function DefaultChatPanel() {
    const [selectedModel] = useState('gpt-4')

    const { messages, isStreaming, sendMessage, stopStreaming, clearChat } = useChatMessages({
        sendMessageToApi: async (params) => {
            await mockStandardBackend.sendMessage(
                { user_input: params.userInput, model_name: params.modelName },
                params.onEvent,
                params.onComplete,
                params.onError,
                params.abortSignal,
            )
        },
    })

    const handleSendMessage = useCallback(
        async (message: string) => {
            await sendMessage(message, selectedModel)
        },
        [sendMessage, selectedModel],
    )

    return (
        <div className='h-screen bg-gray-900'>
            <ChatPanel
                messages={messages}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
                onStopStreaming={stopStreaming}
                onClearChat={clearChat}
                emptyStateTitle='Hi! 👋 How can I help you today?'
            />
        </div>
    )
}

// OpenAI-style backend with event adapter
function WithOpenAIAdapter() {
    const [selectedModel] = useState('gpt-4')

    const { messages, isStreaming, sendMessage, stopStreaming, clearChat } = useChatMessages({
        sendMessageToApi: async (params) => {
            // Use the adapter to transform OpenAI events to standard format
            await mockOpenAIBackend.sendMessage(
                { user_input: params.userInput },
                (rawEvent) => {
                    const event = openAIEventAdapter(rawEvent)
                    if (event) params.onEvent(event)
                },
                params.onComplete,
                params.onError,
                params.abortSignal,
            )
        },
    })

    const handleSendMessage = useCallback(
        async (message: string) => {
            await sendMessage(message, selectedModel)
        },
        [sendMessage, selectedModel],
    )

    return (
        <div className='h-screen bg-gray-900'>
            <ChatPanel
                messages={messages}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
                onStopStreaming={stopStreaming}
                onClearChat={clearChat}
                emptyStateTitle='OpenAI-style backend demo 🤖'
            />
        </div>
    )
}

// Anthropic-style backend with event adapter
function WithAnthropicAdapter() {
    const [selectedModel] = useState('claude-3-5-sonnet')

    const { messages, isStreaming, sendMessage, stopStreaming, clearChat } = useChatMessages({
        sendMessageToApi: async (params) => {
            // Use the adapter to transform Anthropic events to standard format
            await mockAnthropicBackend.sendMessage(
                { user_input: params.userInput },
                (rawEvent) => {
                    const event = anthropicEventAdapter(rawEvent)
                    if (event) params.onEvent(event)
                },
                params.onComplete,
                params.onError,
                params.abortSignal,
            )
        },
    })

    const handleSendMessage = useCallback(
        async (message: string) => {
            await sendMessage(message, selectedModel)
        },
        [sendMessage, selectedModel],
    )

    return (
        <div className='h-screen bg-gray-900'>
            <ChatPanel
                messages={messages}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
                onStopStreaming={stopStreaming}
                onClearChat={clearChat}
                emptyStateTitle='Anthropic-style backend demo 🧠'
            />
        </div>
    )
}

// With existing messages
function ExistingMessagesDemo() {
    const [selectedModel] = useState('gpt-4')

    const existingMessages: IMessage[] = [
        {
            id: '1',
            role: 'user',
            content: 'What is React?',
            timestamp: new Date(Date.now() - 120000),
        },
        {
            id: '2',
            role: 'assistant',
            content:
                'React is a JavaScript library for building user interfaces. It was developed by Facebook and is now maintained by Meta. React allows developers to create reusable UI components and efficiently update the DOM using a virtual DOM approach.',
            timestamp: new Date(Date.now() - 60000),
        },
        {
            id: '3',
            role: 'user',
            content: 'What are hooks?',
            timestamp: new Date(Date.now() - 30000),
        },
        {
            id: '4',
            role: 'assistant',
            content:
                'Hooks are functions that let you "hook into" React state and lifecycle features from function components. The most common hooks are:\n\n- **useState** - for managing state\n- **useEffect** - for side effects\n- **useContext** - for consuming context\n- **useRef** - for mutable references\n- **useMemo** / **useCallback** - for performance optimization',
            timestamp: new Date(),
        },
    ]

    const { isStreaming, sendMessage, stopStreaming, clearChat } = useChatMessages({
        sendMessageToApi: async (params) => {
            await mockStandardBackend.sendMessage(
                { user_input: params.userInput, model_name: params.modelName },
                params.onEvent,
                params.onComplete,
                params.onError,
                params.abortSignal,
            )
        },
    })

    const handleSendMessage = useCallback(
        async (message: string) => {
            await sendMessage(message, selectedModel)
        },
        [sendMessage, selectedModel],
    )

    return (
        <div className='h-screen bg-gray-900'>
            <ChatPanel
                messages={existingMessages}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
                onStopStreaming={stopStreaming}
                onClearChat={clearChat}
                emptyStateTitle='Continue the conversation...'
            />
        </div>
    )
}

// With custom icon
function CustomIconDemo() {
    const [selectedModel] = useState('gpt-4')

    // Custom robot icon
    const RobotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
        <svg viewBox='0 0 24 24' fill='currentColor' {...props}>
            <path d='M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1H3a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A2.5 2.5 0 005 15.5 2.5 2.5 0 007.5 18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 007.5 13m9 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5z' />
        </svg>
    )

    const config: IChatConfig = {
        icons: {
            assistant: RobotIcon,
        },
    }

    const { messages, isStreaming, sendMessage, stopStreaming, clearChat } = useChatMessages({
        sendMessageToApi: async (params) => {
            await mockStandardBackend.sendMessage(
                { user_input: params.userInput, model_name: params.modelName },
                params.onEvent,
                params.onComplete,
                params.onError,
                params.abortSignal,
            )
        },
    })

    const handleSendMessage = useCallback(
        async (message: string) => {
            await sendMessage(message, selectedModel)
        },
        [sendMessage, selectedModel],
    )

    return (
        <ChatConfigProvider config={config}>
            <div className='h-screen bg-gray-900'>
                <ChatPanel
                    messages={messages}
                    isStreaming={isStreaming}
                    onSendMessage={handleSendMessage}
                    onStopStreaming={stopStreaming}
                    onClearChat={clearChat}
                    emptyStateTitle='Custom robot icon demo 🤖'
                />
            </div>
        </ChatConfigProvider>
    )
}

// Light theme
function LightThemeChatPanel() {
    const [selectedModel] = useState('gpt-4')

    const lightTheme: Partial<ChatTheme> = {
        colors: {
            primary: '#2563eb',
            primaryHover: '#1d4ed8',
            background: '#ffffff',
            backgroundSecondary: '#f8fafc',
            text: '#1e293b',
            textSecondary: '#475569',
            userMessageText: '#ffffff',
            userMessageBg: 'linear-gradient(to bottom right, #10b981, #059669, #0d9488)',
            userMessageGradientFrom: '#10b981',
            userMessageGradientVia: '#059669',
            userMessageGradientTo: '#0d9488',
            assistantMessageBg: '#f1f5f9',
            assistantMessageText: '#1e293b',
            assistantMessageTextSecondary: '#64748b',
            border: '#e2e8f0',
            inputBg: '#ffffff',
            inputBorder: '#e2e8f0',
            inputFocusBorder: '#2563eb',
            inputContainerBg: '#f8fafc',
            aiIconGradientFrom: '#10b981',
            aiIconGradientTo: '#059669',
            scrollbarThumb: '#cbd5e1',
            codeBlockBg: '#f8fafc',
            codeBlockBorder: '#e2e8f0',
        },
    }

    const { messages, isStreaming, sendMessage, stopStreaming, clearChat } = useChatMessages({
        sendMessageToApi: async (params) => {
            await mockStandardBackend.sendMessage(
                { user_input: params.userInput, model_name: params.modelName },
                params.onEvent,
                params.onComplete,
                params.onError,
                params.abortSignal,
            )
        },
    })

    const handleSendMessage = useCallback(
        async (message: string) => {
            await sendMessage(message, selectedModel)
        },
        [sendMessage, selectedModel],
    )

    return (
        <div className='h-screen' style={{ backgroundColor: '#f8fafc' }}>
            <ChatPanel
                messages={messages}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
                onStopStreaming={stopStreaming}
                onClearChat={clearChat}
                theme={lightTheme}
                emptyStateTitle='Hi! 👋 How can I help you today?'
            />
        </div>
    )
}

// Purple/Violet theme
function PurpleThemeChatPanel() {
    const [selectedModel] = useState('gpt-4')

    const purpleTheme: Partial<ChatTheme> = {
        colors: {
            primary: '#7c3aed',
            primaryHover: '#6d28d9',
            background: '#0f0720',
            backgroundSecondary: '#1a0a2e',
            text: '#f5f3ff',
            textSecondary: '#c4b5fd',
            userMessageText: '#ffffff',
            userMessageBg: 'linear-gradient(to bottom right, #7c3aed, #a855f7, #ec4899)',
            userMessageGradientFrom: '#7c3aed',
            userMessageGradientVia: '#a855f7',
            userMessageGradientTo: '#ec4899',
            assistantMessageBg: '#1e1033',
            assistantMessageText: '#f5f3ff',
            assistantMessageTextSecondary: '#a78bfa',
            border: 'rgba(139, 92, 246, 0.3)',
            inputBg: 'rgba(139, 92, 246, 0.1)',
            inputBorder: 'rgba(139, 92, 246, 0.3)',
            inputFocusBorder: '#7c3aed',
            inputContainerBg: 'rgba(139, 92, 246, 0.1)',
            aiIconGradientFrom: '#a855f7',
            aiIconGradientTo: '#7c3aed',
            scrollbarThumb: 'rgba(139, 92, 246, 0.4)',
            codeBlockBg: 'rgba(0, 0, 0, 0.3)',
            codeBlockBorder: 'rgba(139, 92, 246, 0.3)',
        },
    }

    const { messages, isStreaming, sendMessage, stopStreaming, clearChat } = useChatMessages({
        sendMessageToApi: async (params) => {
            await mockStandardBackend.sendMessage(
                { user_input: params.userInput, model_name: params.modelName },
                params.onEvent,
                params.onComplete,
                params.onError,
                params.abortSignal,
            )
        },
    })

    const handleSendMessage = useCallback(
        async (message: string) => {
            await sendMessage(message, selectedModel)
        },
        [sendMessage, selectedModel],
    )

    return (
        <div className='h-screen' style={{ backgroundColor: '#0f0720' }}>
            <ChatPanel
                messages={messages}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
                onStopStreaming={stopStreaming}
                onClearChat={clearChat}
                theme={purpleTheme}
                emptyStateTitle='✨ Ask me anything...'
            />
        </div>
    )
}

// =============================================================================
// Stories
// =============================================================================

export const Default: Story = {
    render: () => <DefaultChatPanel />,
    parameters: {
        docs: {
            description: {
                story: 'Basic usage with standard event format. No ChatConfigProvider needed for simple cases.',
            },
        },
    },
}

export const OpenAIStyleBackend: Story = {
    render: () => <WithOpenAIAdapter />,
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates using an event adapter to transform OpenAI-style streaming events (choices[0].delta.content) to the standard format.',
            },
        },
    },
}

export const AnthropicStyleBackend: Story = {
    render: () => <WithAnthropicAdapter />,
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates using an event adapter to transform Anthropic-style streaming events (content_block_delta) to the standard format.',
            },
        },
    },
}

export const WithExistingMessages: Story = {
    render: () => <ExistingMessagesDemo />,
    parameters: {
        docs: {
            description: {
                story: 'Load a conversation with existing messages. Useful for restoring chat history.',
            },
        },
    },
}

export const WithCustomIcon: Story = {
    render: () => <CustomIconDemo />,
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates using ChatConfigProvider to customize the assistant icon.',
            },
        },
    },
}

export const LightTheme: Story = {
    render: () => <LightThemeChatPanel />,
    parameters: {
        docs: {
            description: {
                story: 'Light theme with green user messages. Shows comprehensive theme customization.',
            },
        },
    },
}

export const PurpleTheme: Story = {
    render: () => <PurpleThemeChatPanel />,
    parameters: {
        docs: {
            description: {
                story: 'Purple/violet dark theme. Demonstrates dramatic color customization.',
            },
        },
    },
}
