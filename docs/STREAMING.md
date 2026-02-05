# Advanced Streaming & Custom Adapters

This guide covers detailed streaming implementations using `sendMessageToApi` and manual configuration for various AI providers.

## Manual Provider Integration

If you need full control over the API call or are using a custom backend, use the `sendMessageToApi` callback.

### OpenAI (Manual)

```tsx
import { streamSSE, createOpenAIAdapter } from '@pulse8-ai/chat'

const { messages, sendMessage } = useChatMessages({
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
```

### Anthropic Claude

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

### Google Gemini

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

## Streaming Utilities

### streamSSE

**How you use it:** You only use `streamSSE` inside your `sendMessageToApi` callback. When the user sends a message, the hook calls `sendMessageToApi(params)`. You call `streamSSE` with your API settings (url, body, headers, adapter) and **forward the hook’s callbacks and signal** from `params`.

**Pattern:** In `sendMessageToApi`, `await streamSSE({ ...your API config..., onEvent: params.onEvent, onComplete: params.onComplete, onError: params.onError, signal: params.abortSignal })`.

```tsx
import { streamSSE } from '@pulse8-ai/chat'

// Inside useChatMessages({ sendMessageToApi: async (params) => { ... } })
await streamSSE({
  url: '/api/chat',
  body: { message: params.userInput },
  headers: { Authorization: 'Bearer ...' },
  adapter: createOpenAIAdapter(),
  onEvent: params.onEvent,
  onComplete: params.onComplete,
  onError: params.onError,
  signal: params.abortSignal,
})
```

### Lower-level Utilities

For custom streaming implementations:

```tsx
import { parseSSELine, createSSEParser } from '@pulse8-ai/chat'

// Parse a single SSE line
const data = parseSSELine('data: {"content": "hello"}')

// Create a stateful parser for chunked data
const parser = createSSEParser({
  onData: (data) => {
    const event = myAdapter(data)
    if (event) handleEvent(event)
  },
})

parser.feed(chunk1)
parser.feed(chunk2)
```
