# @pulse8-ai/chat Public Package - Planning Document

## Executive Summary

This document outlines the architecture for `@pulse8-ai/chat`, a customizable npm package that enables developers to integrate a production-ready chat UI with any AI backend.

---

## Design Principles

1. **Composition over Configuration** - Allow users to compose their own experience
2. **Bring Your Own** - Don't bundle heavy dependencies; let users choose their libraries
3. **Type Safety** - Full TypeScript support with exported types

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Application                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Event     │  │    Theme     │  │   Custom     │       │
│  │   Adapter    │  │Configuration │  │    Icons     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         └────────────────┼─────────────────┘               │
│                          │                                  │
│                 ┌────────▼────────┐                        │
│                 │ChatConfigProvider│                        │
│                 └────────┬────────┘                        │
├──────────────────────────┼──────────────────────────────────┤
│           @pulse8-ai/chat Package                           │
│                          │                                  │
│    ┌─────────────────────┼─────────────────────┐           │
│    ▼                     ▼                     ▼           │
│ ┌──────────┐      ┌──────────┐          ┌──────────┐       │
│ │ChatPanel │      │useChatMsg│          │ Adapters │       │
│ └──────────┘      └──────────┘          └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Any AI Backend      │
              │  (OpenAI, Anthropic,  │
              │   Gemini, Custom)     │
              └───────────────────────┘
```

---

## Key Components

### 1. ChatConfigProvider

Central configuration context that provides:

```typescript
interface IChatConfig {
  eventAdapter?: (rawEvent: unknown) => IStreamEvent | null
  icons?: {
    assistant?: React.ComponentType
    stop?: React.ComponentType
    mic?: React.ComponentType
  }
  theme?: Partial<ChatTheme>
}
```

**Design Decision:** Use React Context to avoid prop drilling and enable configuration at any level.

### 2. Event Adapter Pattern

Transforms any backend format to standard events:

```typescript
// Standard event format
interface IStreamEvent {
  type: 'llm_token' | 'tool_content' | 'tool_start' | 'tool_end' | 'error'
  content?: string
  tool_name?: string
  output?: string
  message?: string
  title?: string
  input?: string
}

// User-defined adapter
const myAdapter = (raw: unknown): IStreamEvent | null => {
  // Transform raw backend event to standard format
  // Return null to skip/filter events
}
```

### 3. Pre-built Adapters

Ready-to-use adapters for popular AI providers:

- **OpenAI:** `createOpenAIAdapter()` / `openAITextAdapter`
- **Anthropic:** `createAnthropicAdapter()` / `anthropicTextAdapter`
- **Gemini:** `createGeminiAdapter()` / `geminiTextAdapter`

---

## API Reference

### Exports

#### Configuration
- `ChatConfigProvider` - Context provider component
- `useChatConfig` - Hook to access configuration
- `defaultEventAdapter` - Default event adapter function

#### Components
- `ChatPanel` - Main chat component
- `ChatContainer` - Message display container
- `ChatInput` - Full-featured input with PDF support
- `ChatInputMinimal` - Simplified input component
- `Message` - Generic message component
- `UserMessage` - User message component
- `AssistantMessage` - Assistant message component
- `MessageContentRenderer` - Markdown + content renderer
- `SuggestedQuestions` - Question suggestion buttons
- `ErrorBoundary` / `MessageErrorBoundary` - Error handling

#### Hooks
- `useChatMessages` - Chat state management
- `useModelSelection` - Model selection state

#### Types
- `IMessage` - Message structure
- `IToolOutput` - Tool output structure
- `IPdfFile` - PDF file structure
- `ChatTheme` - Theme configuration
- `IChartData` - Abstract chart data
- `IChartRendererProps` - Chart renderer props

#### UI Components
- `Button`
- `Input`
- `Select`
- `Textarea`

#### Icons
- `AssistantIcon` - Default assistant icon
- `StopCircleIcon` - Stop button icon
- `MicIcon` - Microphone icon
- `ChecksIcon` - Check marks icon

---

## Usage Example

### Basic Setup

```tsx
import { ChatPanel, ChatConfigProvider } from '@pulse8-ai/chat'

function App() {
  const handleSendMessage = async (params) => {
    // Your API call logic here
    await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: params.userInput }),
    })
  }

  return (
    <ChatConfigProvider>
      <ChatPanel
        sendMessageToApi={handleSendMessage}
        suggestedQuestions={['What can you help me with?']}
      />
    </ChatConfigProvider>
  )
}
```

### With OpenAI Adapter

```tsx
import { 
  ChatPanel, 
  ChatConfigProvider, 
  createOpenAIAdapter,
  streamSSE
} from '@pulse8-ai/chat'

const openAIAdapter = createOpenAIAdapter()

function App() {
  const handleSendMessage = async ({ userInput, onEvent, onComplete, onError }) => {
    await streamSSE({
      url: 'https://api.openai.com/v1/chat/completions',
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: {
        model: 'gpt-4',
        messages: [{ role: 'user', content: userInput }],
        stream: true,
      },
      onEvent: (raw) => {
        const event = openAIAdapter(raw)
        if (event) onEvent(event)
      },
      onComplete,
      onError,
    })
  }

  return (
    <ChatConfigProvider config={{ eventAdapter: openAIAdapter }}>
      <ChatPanel sendMessageToApi={handleSendMessage} />
    </ChatConfigProvider>
  )
}
```

### With Custom Icons

```tsx
import { ChatConfigProvider, ChatPanel, AssistantIcon } from '@pulse8-ai/chat'
import { MyCustomBotIcon } from './icons'

<ChatConfigProvider config={{
  icons: {
    assistant: MyCustomBotIcon, // Your custom icon
  }
}}>
  <ChatPanel {...props} />
</ChatConfigProvider>
```

---

## Design Decisions

### 1. No Heavy Dependencies

**Decision:** Remove ECharts, Plotly, and TanStack Table from dependencies.

**Rationale:**
- ECharts: ~1MB minified
- Plotly: ~3.5MB minified
- TanStack Table: ~50KB minified
- Total savings: ~4.5MB

**Impact:** Users provide their own chart/table implementations if needed.

### 2. Context-Based Configuration

**Decision:** Use React Context for configuration.

**Rationale:**
- Cleaner API than prop drilling
- Works with deeply nested components
- Pattern familiar to React developers

### 3. Event Adapter Pattern

**Decision:** Allow custom event transformation via adapter functions.

**Rationale:**
- Different backends have different event formats
- Keeps core package format-agnostic
- Enables filtering (return null to skip events)

---

## File Structure

```
src/
├── adapters/
│   ├── index.ts
│   ├── types.ts
│   ├── openai.ts
│   ├── anthropic.ts
│   └── gemini.ts
├── assets/
│   ├── index.ts
│   ├── AssistantIcon.tsx
│   ├── StopCircleIcon.tsx
│   ├── MicIcon.tsx
│   └── ChecksIcon.tsx
├── components/
│   ├── ChatPanel/
│   ├── ChatContainer/
│   ├── ChatInput/
│   ├── ChatInputMinimal/
│   ├── Message/
│   ├── UserMessage/
│   ├── AssistantMessage/
│   ├── MessageContentRenderer/
│   ├── SuggestedQuestions/
│   ├── ErrorBoundary/
│   ├── markdownComponents/
│   └── ui/
│       ├── Button/
│       ├── Input/
│       ├── Select/
│       └── Textarea/
├── context/
│   ├── index.ts
│   └── ChatConfigContext.tsx
├── hooks/
│   ├── useChatMessages.ts
│   └── useModelSelection.ts
├── theme/
│   └── index.ts
├── types/
│   ├── index.ts
│   └── chart.ts
├── utils/
│   ├── index.ts
│   └── streaming.ts
└── index.ts
```

---

## Dependency List

| Dependency | Type | Notes |
|------------|------|-------|
| react | peer | >= 18.0.0 |
| react-dom | peer | >= 18.0.0 |
| uuid | runtime | ID generation |
| react-markdown | runtime | Markdown rendering |
| remark-gfm | runtime | GitHub Flavored Markdown |
| @heroicons/react | runtime | Icons |
| clsx | runtime | Class name utility |

---

## Future Considerations

1. **Plugin System:** Extensions for additional functionality
2. **Server Components:** React Server Components support
3. **Accessibility:** Enhanced a11y features
4. **Voice Input:** Built-in speech-to-text support
