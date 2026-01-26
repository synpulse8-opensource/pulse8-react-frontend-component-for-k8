import type { Meta, StoryObj } from '@storybook/react'
import { Message } from './index'

const meta: Meta<typeof Message> = {
    title: 'Components/Message',
    component: Message,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Message>

export const UserMessage: Story = {
    args: {
        message: {
            id: '1',
            role: 'user',
            content: 'What is the weather today?',
            timestamp: new Date(),
        },
        isLatest: false,
        isStreaming: false,
    },
}

export const AssistantMessage: Story = {
    args: {
        message: {
            id: '2',
            role: 'assistant',
            content:
                "I don't have access to real-time weather data, but I can help you find weather information through a web search. Would you like me to search for the current weather in your location?",
            timestamp: new Date(),
        },
        isLatest: false,
        isStreaming: false,
    },
}

export const AssistantMessageWithMarkdown: Story = {
    args: {
        message: {
            id: '3',
            role: 'assistant',
            content: `Here's some **markdown** content:

- Item 1
- Item 2
- Item 3

\`\`\`javascript
const code = 'example'
\`\`\`

[Link](https://example.com)`,
            timestamp: new Date(),
        },
        isLatest: false,
        isStreaming: false,
    },
}
