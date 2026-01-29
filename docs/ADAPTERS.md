# Custom Event Adapters

If your backend uses a different format, create a custom adapter to transform events to the standard format.

## Creating a Custom Adapter

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

## SSE Response Example

Your backend should return Server-Sent Events in this format:

```
data: {"type":"llm_token","content":"Hello"}

data: {"type":"tool_start","tool_name":"search","title":"Searching..."}

data: {"type":"tool_end","tool_name":"search","output":"{\"results\":[...]}"}

data: {"type":"llm_token","content":"Here are the results:"}
```

## Pre-built Adapters

The library ships with adapters for major AI providers:

| Provider | Full Adapter | Text-Only Adapter | Tool Support |
|----------|--------------|-------------------|--------------|
| OpenAI | `createOpenAIAdapter()` | `openAITextAdapter` | Function Calling |
| Anthropic | `createAnthropicAdapter()` | `anthropicTextAdapter` | Tool Use |
| Google Gemini | `createGeminiAdapter()` | `geminiTextAdapter` | Function Calling |

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
