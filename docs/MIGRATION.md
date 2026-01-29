# Migration Guide

## Migration from v0.1.x to v0.2.0

### Breaking Changes

1. **Removed Built-in Chart/Table Components**
   - Chart and Table components removed from core package
   - Register your own via `ChatConfigProvider.toolRenderers`

2. **Tool Renderers Must Be Registered**
   - No built-in renderers for specific tools
   - Use `ChatConfigProvider` to register custom renderers

3. **K8Icon Deprecated**
   - Use `AssistantIcon` or provide custom via `config.icons`

### New Features in v0.2.0

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

### Tool Renderer Migration

```tsx
// Before (v0.1.x) - built-in chart component
// The Chart component was automatically used

// After (v0.2.0) - register your own
import { ChatConfigProvider } from '@pulse8-ai/chat'
import MyChartComponent from './MyChartComponent'

const config = {
  toolRenderers: {
    'generate_chart': MyChartComponent,
  },
  inlineTools: ['generate_chart'],
}

function App() {
  return (
    <ChatConfigProvider config={config}>
      <ChatPage />
    </ChatConfigProvider>
  )
}
```
