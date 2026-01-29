# Troubleshooting

## Common Issues

### Styles not loading

Make sure you import the CSS file:

```tsx
import '@pulse8-ai/chat/styles.css'
```

### TypeScript errors with theme

Provide a `Partial<ChatTheme>` type:

```tsx
import type { ChatTheme } from '@pulse8-ai/chat'

const theme: Partial<ChatTheme> = {
  colors: {
    primary: '#6366f1',
  },
}
```

### Streaming not working

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

### Messages not updating

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

### PDF upload not working

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

## Getting Help

- **GitHub Issues**: [pulse8-ai/pulse8-ai-chat/issues](https://github.com/pulse8-ai/pulse8-ai-chat/issues)
- **Documentation**: Check the README and JSDoc comments
- **Examples**: See the Storybook examples (`npm run storybook`)
