# @pulse8-ai/chat

A pluggable, customizable chat UI component library for React applications. Build AI chat interfaces with any backend, custom tool renderers, and full theming support.

## Features

- **Backend Agnostic** - Works with any AI backend (OpenAI, Anthropic, Gemini, custom APIs)
- **Pre-built Adapters** - Out-of-the-box adapters for OpenAI, Anthropic, and Google Gemini
- **Streaming Utilities** - Built-in SSE parsing and streaming helpers
- **Custom Tool Renderers** - Register your own components for tool outputs (charts, tables, etc.)
- **Event Adapter Pattern** - Transform any backend response format to the standard event format
- **Full Theme Customization** - Customize colors, fonts, and all visual elements
- **Streaming Support** - Real-time message streaming with proper state management
- **PDF Upload Support** - Built-in support for file attachments
- **TypeScript First** - Full TypeScript support with exported types
- **Minimal Dependencies** - Core package has minimal dependencies; bring your own chart/table libraries

## Installation

```bash
npm install @pulse8-ai/chat
```

### Peer Dependencies

```bash
npm install react react-dom
```

### Adding Styles

```tsx
// In your main.tsx or App.tsx
import '@pulse8-ai/chat/styles.css'
```

### Basic Usage (New Simplified API)

The easiest way to get started is using the `streamConfig` option:

```tsx
import { ChatPanel, useChatMessages, openAIStreamConfig } from '@pulse8-ai/chat'
import '@pulse8-ai/chat/styles.css'

function ChatPage() {
  const { messages, isStreaming, sendMessage, stopStreaming } = useChatMessages({
    streamConfig: openAIStreamConfig({ apiKey: OPENAI_API_KEY })
  })

  return (
    <div className="h-screen bg-gray-900">
      <ChatPanel
        messages={messages}
        isStreaming={isStreaming}
        onSendMessage={(msg) => sendMessage(msg, 'gpt-4')}
        onStopStreaming={stopStreaming}
        emptyStateTitle="Hi! How can I help you today?"
      />
    </div>
  )
}
```

### Custom Usage (With `sendMessageToApi`)

If you need full control over the API call (e.g. custom headers, complex body transformation), use `sendMessageToApi`. For detailed provider examples, see [Advanced Streaming](docs/STREAMING.md).

```tsx
const { messages, sendMessage } = useChatMessages({
  sendMessageToApi: async (params) => {
    await streamSSE({
      url: '/api/chat',
      body: { message: params.userInput },
      adapter: createOpenAIAdapter(),
      onEvent: params.onEvent,
      onComplete: params.onComplete,
      onError: params.onError,
      signal: params.abortSignal,
    })
  },
})
```
### Simple Message Appending (Custom Logic)

If you don't need streaming (e.g. your API returns the full response at once) or if you want to implement custom message flows, use the append helpers. This is often the **easiest way** to integrate with existing REST APIs.

```tsx
const { appendUserMessage, appendAssistantMessage } = useChatMessages({
  sendMessageToApi: async () => {}, // no-op when you only append
})

const handleSend = async (question: string) => {
  // 1. Add the user message to UI immediately
  appendUserMessage(question)

  // 2. Call your API
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ question }),
  })
  const data = await response.json()

  // 3. Add the assistant response to UI
  appendAssistantMessage(data.answer)
}
```

- **`appendUserMessage(content)`** – add a user message.
- **`appendAssistantMessage(content)`** – add an assistant message (includes fade-in animation).
- **`appendMessage({ role, content, ... })`** – full control over ID, timestamp, etc.

## Pre-built Adapters

The library ships with adapters for major AI providers:

| Provider | Full Adapter | Text-Only Adapter | Tool Support |
|----------|--------------|-------------------|--------------|
| OpenAI | `createOpenAIAdapter()` | `openAITextAdapter` | Function Calling |
| Anthropic | `createAnthropicAdapter()` | `anthropicTextAdapter` | Tool Use |
| Google Gemini | `createGeminiAdapter()` | `geminiTextAdapter` | Function Calling |

```tsx
// From main package
import { createOpenAIAdapter, streamSSE } from '@pulse8-ai/chat'

// Or from subpaths (tree-shakeable)
import { createOpenAIAdapter } from '@pulse8-ai/chat/adapters'
import { streamSSE } from '@pulse8-ai/chat/utils'
```

## Streaming Utilities

For advanced custom streaming implementations using SSE, see [Advanced Streaming](docs/STREAMING.md).

- `streamSSE` - Main utility for SSE connections
- `parseSSELine` - Low-level line parser
- `createSSEParser` - Stateful parser for chunked data

## Configuration

### ChatConfigProvider

Wrap your app with `ChatConfigProvider` to customize tool renderers, event adapters, and more:

```tsx
import { ChatConfigProvider, ChatPanel } from '@pulse8-ai/chat'
import type { IChatConfig } from '@pulse8-ai/chat'

const chatConfig: IChatConfig = {
  toolRenderers: {
    'generate_chart': MyChartRenderer,
    'search_results': MySearchRenderer,
  },
  toolNameMapping: {
    'generate_chart': 'Chart',
    'search_results': 'Web Search',
  },
  inlineTools: ['generate_chart'],
  hiddenTools: ['internal_lookup'],
}

function App() {
  return (
    <ChatConfigProvider config={chatConfig}>
      <ChatPage />
    </ChatConfigProvider>
  )
}
```

## Components

### ChatPanel

Main component combining messages and input:

```tsx
<ChatPanel
  messages={messages}
  isStreaming={isStreaming}
  onSendMessage={handleSendMessage}
  onStopStreaming={stopStreaming}
  uploadedPdfs={uploadedPdfs}
  onUploadPdf={handleUploadPdf}
  onRemovePdf={handleRemovePdf}
  onClearChat={handleClearChat}
  emptyStateTitle="How can I help?"
  theme={customTheme}
  availableModels={models}
  selectedModel={selectedModel}
  onModelChange={setSelectedModel}
/>
```

### Individual Components

For custom layouts:

- `ChatContainer` - Message display area
- `ChatInput` - Input with PDF upload support
- `ChatInputMinimal` - Simplified input
- `Message` - Generic message component
- `UserMessage` - User message styling
- `AssistantMessage` - Assistant message with tool outputs
- `MessageContentRenderer` - Markdown and tool rendering
- `SuggestedQuestions` - Question suggestions

## Hooks

### useChatMessages

Manages chat state and streaming:

```tsx
const {
  messages,            // IMessage[]
  isStreaming,         // boolean
  uploadedPdfs,        // IPdfFile[]
  sendMessage,         // (message: string, model: string) => Promise<void>
  stopStreaming,       // () => void
  addPdf,              // (pdf: IPdfFile) => void
  removePdf,           // (uuid: string) => void
  clearChat,           // () => void
  appendMessage,       // (message: Partial<IMessage>) => void
  appendUserMessage,   // (content: string, attachedFiles?: IPdfFile[]) => void
  appendAssistantMessage, // (content: string) => void
} = useChatMessages({
  sendMessageToApi: async (params) => { ... },
  generateId: () => uuid(),  // Optional custom ID generator
  maxMessages: 100,          // Optional message limit
})
```

### useModelSelection

Manages AI model selection:

```tsx
const { selectedModel, setSelectedModel, availableModels } = useModelSelection({
  defaultModel: 'gpt-4',
  models: [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'claude-3', name: 'Claude 3' },
  ],
})
```

## Types

```typescript
interface IMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachedFiles?: IPdfFile[]
  toolOutputs?: IToolOutput[]
  contentSegments?: IContentSegment[]
  timestamp: Date
}

interface IToolOutput {
  toolName: string
  friendlyName: string
  output: string
  visible: boolean
  title?: string
}

interface IPdfFile {
  uuid: string
  name: string
}

type EventAdapter = (rawEvent: unknown) => IStreamEvent | null
```

## UI Components

Reusable UI primitives:

```tsx
import { Button, Input, Select, Textarea } from '@pulse8-ai/chat'
// or
import { Button } from '@pulse8-ai/chat/ui'
```

## Error Handling

The package includes error boundaries to prevent crashes:

```tsx
import { ErrorBoundary, MessageErrorBoundary } from '@pulse8-ai/chat'

<ErrorBoundary
  fallback={<div>Chat is temporarily unavailable</div>}
  onError={(error) => logToService(error)}
>
  <ChatPanel {...props} />
</ErrorBoundary>
```

## Documentation

For detailed guides, see:

- [Advanced Streaming](docs/STREAMING.md) - Manual provider integration and lower-level utilities
- [Custom Adapters](docs/ADAPTERS.md) - Create adapters for custom backends
- [Theming](docs/THEMING.md) - Customize colors and appearance
- [Custom Tool Renderers](docs/TOOL_RENDERERS.md) - Build chart, table, and other renderers
- [Migration Guide](docs/MIGRATION.md) - Upgrade from v0.1.x to v0.2.0
- [Security](docs/SECURITY.md) - Security best practices
- [Accessibility](docs/ACCESSIBILITY.md) - Accessibility features and testing
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Run Storybook
npm run storybook
```

## Requirements

- React ^18.0.0 || ^19.0.0
- React DOM ^18.0.0 || ^19.0.0

### Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 14+ |
| Edge | 80+ |

**Note**: Requires support for:
- Fetch API with streaming (ReadableStream)
- ES2020+ features
- CSS Custom Properties

## License

MIT - see [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
