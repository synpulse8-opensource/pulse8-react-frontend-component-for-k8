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

## Quick Start

### Basic Usage (with Pre-built Adapters)

The easiest way to get started is using the pre-built adapters:

```tsx
import { ChatPanel, useChatMessages, streamSSE, createOpenAIAdapter } from '@pulse8-ai/chat'
import '@pulse8-ai/chat/styles.css'

function ChatPage() {
  const { messages, isStreaming, sendMessage, stopStreaming } = useChatMessages({
    sendMessageToApi: async (params) => {
      await streamSSE({
        url: 'https://api.openai.com/v1/chat/completions',
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: {
          model: 'gpt-4',
          messages: [{ role: 'user', content: params.userInput }],
          stream: true,
        },
        adapter: createOpenAIAdapter(),
        onEvent: params.onEvent,
        onComplete: params.onComplete,
        onError: params.onError,
        signal: params.abortSignal,
      })
    },
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

### With Anthropic Claude

```tsx
import { streamSSE, createAnthropicAdapter } from '@pulse8-ai/chat'

const { messages, sendMessage } = useChatMessages({
  sendMessageToApi: async (params) => {
    await streamSSE({
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: params.userInput }],
        stream: true,
      },
      adapter: createAnthropicAdapter(),
      onEvent: params.onEvent,
      onComplete: params.onComplete,
      onError: params.onError,
      signal: params.abortSignal,
    })
  },
})
```

### With Google Gemini

```tsx
import { streamSSE, createGeminiAdapter } from '@pulse8-ai/chat'

const { messages, sendMessage } = useChatMessages({
  sendMessageToApi: async (params) => {
    await streamSSE({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${GEMINI_API_KEY}`,
      body: {
        contents: [{ parts: [{ text: params.userInput }] }],
      },
      adapter: createGeminiAdapter(),
      onEvent: params.onEvent,
      onComplete: params.onComplete,
      onError: params.onError,
      signal: params.abortSignal,
    })
  },
})
```

## Pre-built Adapters

The library ships with adapters for major AI providers:

| Provider | Full Adapter | Text-Only Adapter | Tool Support |
|----------|--------------|-------------------|--------------|
| OpenAI | `createOpenAIAdapter()` | `openAITextAdapter` | ✅ Function Calling |
| Anthropic | `createAnthropicAdapter()` | `anthropicTextAdapter` | ✅ Tool Use |
| Google Gemini | `createGeminiAdapter()` | `geminiTextAdapter` | ✅ Function Calling |

### Import Paths

```tsx
// From main package
import { createOpenAIAdapter, streamSSE } from '@pulse8-ai/chat'

// Or from subpaths (tree-shakeable)
import { createOpenAIAdapter } from '@pulse8-ai/chat/adapters'
import { streamSSE } from '@pulse8-ai/chat/utils'
```

### Adapter Types

```typescript
// Full adapters - create stateful instances for tool tracking
const openaiAdapter = createOpenAIAdapter()
const anthropicAdapter = createAnthropicAdapter()
const geminiAdapter = createGeminiAdapter()

// Text-only adapters - stateless, simpler
import { openAITextAdapter, anthropicTextAdapter, geminiTextAdapter } from '@pulse8-ai/chat'
```

## Streaming Utilities

### streamSSE

The main utility for connecting to streaming AI APIs:

```tsx
import { streamSSE } from '@pulse8-ai/chat'

await streamSSE({
  url: '/api/chat',
  body: { message: 'Hello' },
  headers: { Authorization: 'Bearer ...' },
  adapter: myAdapter,
  onEvent: (event) => console.log(event),
  onComplete: () => console.log('Done!'),
  onError: (error) => console.error(error),
  signal: abortController.signal,
})
```

### Lower-level Utilities

For custom streaming implementations:

```tsx
import { parseSSELine, createSSEParser } from '@pulse8-ai/chat'

// Parse a single SSE line
const data = parseSSELine('data: {"content": "hello"}')
// → { content: "hello" }

// Create a stateful parser for chunked data
const parser = createSSEParser({
  onData: (data) => {
    const event = myAdapter(data)
    if (event) handleEvent(event)
  },
})

// Feed chunks as they arrive
parser.feed(chunk1)
parser.feed(chunk2)
```

## Custom Event Adapters

If your backend uses a different format, create a custom adapter:

```tsx
import type { IStreamEvent, EventAdapter } from '@pulse8-ai/chat'

// Your backend's event format
interface MyBackendEvent {
  eventType: 'TEXT' | 'TOOL_CALL' | 'TOOL_RESULT' | 'ERROR'
  text?: string
  toolName?: string
  toolResult?: unknown
  error?: string
}

// Adapter to transform to standard format
const myEventAdapter: EventAdapter = (raw: unknown): IStreamEvent | null => {
  const event = raw as MyBackendEvent
  
  switch (event.eventType) {
    case 'TEXT':
      return { type: 'llm_token', content: event.text }
    case 'TOOL_CALL':
      return { type: 'tool_start', tool_name: event.toolName }
    case 'TOOL_RESULT':
      return { 
        type: 'tool_end', 
        tool_name: event.toolName,
        output: JSON.stringify(event.toolResult)
      }
    case 'ERROR':
      return { type: 'error', message: event.error }
    default:
      return null
  }
}

// Use with streamSSE
await streamSSE({
  url: '/api/chat',
  adapter: myEventAdapter,
  // ...
})
```

## Standard Event Format

The library uses this internal event format:

```typescript
interface IStreamEvent {
  type: 'llm_token' | 'tool_content' | 'tool_start' | 'tool_end' | 'error'
  content?: string      // For llm_token/tool_content
  tool_name?: string    // For tool_start/tool_end
  output?: string       // For tool_end (JSON string)
  message?: string      // For error
  title?: string        // Optional title for tools
  input?: string        // Optional input for tool_start
}
```

**SSE Response Example:**

```
data: {"type":"llm_token","content":"Hello"}

data: {"type":"tool_start","tool_name":"search","title":"Searching..."}

data: {"type":"tool_end","tool_name":"search","output":"{\"results\":[...]}"}

data: {"type":"llm_token","content":"Here are the results:"}
```

## Configuration

### ChatConfigProvider

Wrap your app with `ChatConfigProvider` to customize tool renderers, event adapters, and more:

```tsx
import { ChatConfigProvider, ChatPanel } from '@pulse8-ai/chat'
import type { IChatConfig } from '@pulse8-ai/chat'

const chatConfig: IChatConfig = {
  // Register custom tool renderers
  toolRenderers: {
    'generate_chart': MyChartRenderer,
    'search_results': MySearchRenderer,
  },
  
  // Map tool names to friendly display names
  toolNameMapping: {
    'generate_chart': 'Chart',
    'search_results': 'Web Search',
  },
  
  // Tools to render inline in messages
  inlineTools: ['generate_chart'],
  
  // Tools to hide from the UI
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

## Custom Tool Renderers

Create custom components to render tool outputs:

```tsx
import type { IToolRendererComponentProps } from '@pulse8-ai/chat'

const MyChartRenderer: React.FC<IToolRendererComponentProps> = ({ 
  output, 
  title, 
  theme 
}) => {
  // Parse the tool output
  const data = JSON.parse(output)
  
  // Render using your preferred chart library
  return (
    <div className="my-chart">
      {title && <h3>{title}</h3>}
      <MyChartLibrary data={data} />
    </div>
  )
}
```

Register the renderer via `ChatConfigProvider`:

```tsx
const config: IChatConfig = {
  toolRenderers: {
    'generate_chart': MyChartRenderer,
  },
  inlineTools: ['generate_chart'], // Show inline in message
}
```

## Theming

Customize the visual appearance with partial theme overrides:

```tsx
import type { ChatTheme } from '@pulse8-ai/chat'

const customTheme: Partial<ChatTheme> = {
  colors: {
    primary: '#6366f1',
    background: '#1a1a2e',
    text: '#ffffff',
    userMessageGradientFrom: '#8b5cf6',
    userMessageGradientVia: '#6366f1',
    userMessageGradientTo: '#3b82f6',
    assistantMessageBg: '#2d2d44',
    assistantMessageText: '#ffffff',
    // Chart colors for custom chart implementations
    chartColors: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'],
  },
}

<ChatPanel theme={customTheme} {...props} />
```

### Available Theme Properties

- **Primary colors**: `primary`, `primaryHover`, `primaryLight`
- **Backgrounds**: `background`, `backgroundSecondary`, `backgroundTertiary`
- **Text**: `text`, `textSecondary`, `textTertiary`, `textMuted`
- **Messages**: `userMessageBg`, `userMessageGradient*`, `assistantMessageBg`
- **Buttons**: `buttonPrimary`, `buttonPrimaryHover`, `buttonSecondary`
- **Inputs**: `inputBg`, `inputBorder`, `inputFocusBorder`
- **Charts**: `chartColors[]`, `chartGridLine`, `chartAxis`
- **Status**: `success`, `error`, `warning`, `info`
- **UI Elements**: `codeBlockBg`, `tableHeaderBg`, `toolContainerBg`

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
  messages,       // IMessage[]
  isStreaming,    // boolean
  uploadedPdfs,   // IPdfFile[]
  sendMessage,    // (message: string, model: string) => Promise<void>
  stopStreaming,  // () => void
  addPdf,         // (pdf: IPdfFile) => void
  removePdf,      // (uuid: string) => void
  clearChat,      // () => void
} = useChatMessages({
  sendMessageToApi: async (params) => { ... },
  generateId: () => uuid(),  // Optional custom ID generator
  toolNameMapping: { ... },  // Optional, overrides config
  inlineTools: [...],        // Optional, overrides config
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

// For custom chart implementations
interface IChartData {
  type: 'line' | 'bar' | 'pie' | string
  title?: string
  data?: Array<{ label: string; value: number }>
  xAxis?: { label?: string; data?: string[] }
  yAxis?: { label?: string }
  series?: Array<{ name?: string; data: number[] }>
}

// Event adapter function signature
type EventAdapter = (rawEvent: unknown) => IStreamEvent | null
```

## UI Components

Reusable UI primitives:

```tsx
import { Button, Input, Select, Textarea } from '@pulse8-ai/chat'
// or
import { Button } from '@pulse8-ai/chat/ui'
```

## Migration from v0.1.x

### Breaking Changes in v0.2.0

1. **Removed Built-in Chart/Table Components**
   - Chart and Table components removed from core package
   - Register your own via `ChatConfigProvider.toolRenderers`

2. **Tool Renderers Must Be Registered**
   - No built-in renderers for specific tools
   - Use `ChatConfigProvider` to register custom renderers

3. **K8Icon Deprecated**
   - Use `AssistantIcon` or provide custom via `config.icons`

### New in v0.2.0

1. **Pre-built Adapters** - `createOpenAIAdapter()`, `createAnthropicAdapter()`, `createGeminiAdapter()`
2. **Streaming Utilities** - `streamSSE()`, `parseSSELine()`, `createSSEParser()`
3. **Simplified Integration** - Much less boilerplate for common backends

### Migration Steps

```tsx
// Before (v0.1.x) - lots of boilerplate
const { messages, sendMessage } = useChatMessages({
  sendMessageToApi: async (params) => {
    const response = await fetch('/api/chat', { ... })
    const reader = response.body.getReader()
    // ... 30+ lines of SSE parsing code
  },
})

// After (v0.2.0) - use pre-built utilities
import { streamSSE, createOpenAIAdapter } from '@pulse8-ai/chat'

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

## Security

This package includes several security measures to protect against common vulnerabilities:

### XSS Prevention

- **URL Sanitization**: All URLs in markdown links are sanitized. Only `http:`, `https:`, `mailto:`, and `tel:` protocols are allowed. Potentially dangerous protocols like `javascript:` and `data:` are blocked.
- **Markdown Rendering**: Uses `react-markdown` which provides safe HTML rendering by default. The content is not passed through `dangerouslySetInnerHTML`.
- **External Links**: All external links include `rel="noopener noreferrer nofollow"` attributes.

### JSON Parsing Protection

The streaming utilities include protection against malicious payloads:

```tsx
import { safeJsonParse, DEFAULT_MAX_JSON_SIZE, DEFAULT_MAX_JSON_DEPTH } from '@pulse8-ai/chat'

// Parse with default limits (1MB size, 100 levels depth)
const data = safeJsonParse(jsonString)

// Or with custom limits
const data = safeJsonParse(jsonString, 512 * 1024, 50) // 512KB, 50 levels
```

### File Upload Security

When implementing file uploads:

1. **Validate file types** on both client and server
2. **Set size limits** appropriate for your use case
3. **Scan uploaded files** for malware on the server
4. **Store files securely** with proper access controls

```tsx
// Example: Client-side validation
const handleUpload = async (file: File) => {
  // Check file type
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed')
  }

  // Check file size (e.g., 10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10MB')
  }

  // Proceed with upload
  return await uploadToServer(file)
}
```

### Content Security Policy (CSP)

For production deployments, we recommend implementing a strict CSP:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

### Reporting Security Issues

If you discover a security vulnerability, please email security@pulse8.ai instead of opening a public issue.

## Accessibility

This package is designed with accessibility in mind, following WCAG 2.1 guidelines.

### Features

- **ARIA Labels**: All interactive elements have proper ARIA labels
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Semantic HTML and ARIA live regions for dynamic content
- **Focus Management**: Proper focus indicators and focus trapping in modals

### Component Accessibility

| Component | Features |
|-----------|----------|
| `ChatContainer` | `role="log"`, `aria-live="polite"`, keyboard scrollable |
| `ChatInput` | Labeled input, button descriptions, menu accessibility |
| `Message` | `role="listitem"`, `aria-busy` for streaming |
| `ErrorBoundary` | `role="alert"`, `aria-live="assertive"` |

### Usage Tips

```tsx
// The chat container supports keyboard navigation
<ChatPanel
  messages={messages}
  // ... other props
/>

// Screen readers will announce new messages automatically
// due to aria-live="polite" on the message container
```

### Testing Accessibility

We recommend testing with:
- **VoiceOver** (macOS)
- **NVDA** (Windows)
- **axe DevTools** browser extension
- **Lighthouse** accessibility audit

## Error Handling

### Error Boundaries

The package includes error boundaries to prevent crashes:

```tsx
import { ErrorBoundary, MessageErrorBoundary } from '@pulse8-ai/chat'

// Wrap your entire chat for global error handling
<ErrorBoundary
  fallback={<div>Chat is temporarily unavailable</div>}
  onError={(error) => logToService(error)}
>
  <ChatPanel {...props} />
</ErrorBoundary>

// MessageErrorBoundary is automatically used in MessageContentRenderer
// to handle individual message rendering errors gracefully
```

### Custom Error Handling

```tsx
<ErrorBoundary
  renderError={(error, resetError) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={resetError}>Try Again</button>
    </div>
  )}
>
  <ChatPanel {...props} />
</ErrorBoundary>
```

## Troubleshooting

### Common Issues

#### Styles not loading

Make sure you import the CSS file:

```tsx
import '@pulse8-ai/chat/styles.css'
```

#### TypeScript errors with theme

Provide a `Partial<ChatTheme>` type:

```tsx
import type { ChatTheme } from '@pulse8-ai/chat'

const theme: Partial<ChatTheme> = {
  colors: {
    primary: '#6366f1',
  },
}
```

#### Streaming not working

1. Verify your API returns Server-Sent Events (SSE)
2. Check that CORS headers allow streaming
3. Ensure the `Content-Type` is `text/event-stream`
4. Verify the adapter matches your backend format

```tsx
// Debug streaming issues
await streamSSE({
  url: '/api/chat',
  adapter: (raw) => {
    console.log('Raw event:', raw)  // Debug: log raw events
    return myAdapter(raw)
  },
  onEvent: (event) => console.log('Parsed event:', event),
  // ...
})
```

#### Messages not updating

Ensure you're passing the correct state and callbacks:

```tsx
const { messages, isStreaming, sendMessage } = useChatMessages({
  sendMessageToApi: async (params) => {
    // Make sure to call ALL callbacks
    params.onEvent(...)    // For each event
    params.onComplete()    // When done
    params.onError(...)    // On error
  },
})
```

#### PDF upload not working

1. Check that `onUploadPdf` is provided
2. Verify your upload endpoint accepts the file
3. Ensure the function returns the file UUID

```tsx
const handleUpload = async (file: File, onProgress: (n: number) => void) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const { uuid } = await response.json()
  onProgress(100)
  return uuid  // Must return UUID
}
```

### Getting Help

- **GitHub Issues**: [pulse8-ai/pulse8-ai-chat/issues](https://github.com/pulse8-ai/pulse8-ai-chat/issues)
- **Documentation**: Check the README and JSDoc comments
- **Examples**: See the Storybook examples (`npm run storybook`)

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
