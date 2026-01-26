# @pulse8-ai/chat: Internal vs Public Package Comparison

This document compares the **old internal package** (`pulse8-ai-frontend/packages/chat`) with the **new public package** (`pulse8-ai-chat`) to show how the architecture evolved from a tightly-coupled internal tool to a flexible public library.

## Executive Summary

| Aspect | OLD (Internal) | NEW (Public) |
|--------|----------------|--------------|
| Tool renderers | 8 hardcoded renderers | User provides their own |
| Tool name mapping | Hardcoded in hook | User handles in their renderers |
| Tool display | Toggle buttons, inline/hidden lists | Always inline (simple) |
| Backend format | Assumes Pulse8 BE format | Adapter pattern (any format) |
| Dependencies | Heavy (~5MB: ECharts, Plotly, TanStack Table) | Minimal (~200KB) |
| Branding | K8 icon hardcoded | Generic AssistantIcon (customizable) |
| Target audience | Internal Pulse8 developers only | Any developer |

## Architecture Comparison

### OLD: Tightly Coupled to Internal Backend

The old package had hardcoded assumptions about the Pulse8 backend:

- `useChatMessages()` contained hardcoded tool name mappings for 8 specific tools
- `ToolRenderer` component had a fixed map of 8 domain-specific renderers
- `toolUtils.ts` defined hardcoded arrays for inline and hidden tools
- Toggle buttons to show/hide tool outputs
- Heavy chart libraries (ECharts, Plotly) were bundled whether used or not (~5MB)
- K8 branding icon was the only option

### NEW: Clean & Minimal

The new package is simple and focused:

- `ChatConfigProvider` for event adapters, icons, and themes
- Event adapters transform any backend format to the standard format
- No built-in tool renderers (no heavy dependencies bundled)
- Tools always render inline - no toggle buttons, no visibility complexity
- Pre-built adapters available for OpenAI, Anthropic, and Gemini
- Icons and themes are fully customizable
- ~200KB bundle size

## Detailed Code Comparison

### 1. Tool Name Mapping

**OLD: Hardcoded in the hook (users cannot change)**

```typescript
// OLD: useChatMessages.ts - Fixed mapping bundled in package
const getFriendlyToolName = (internalName: string): string => {
    const nameMap: Record<string, string> = {
        review_news: 'News Impact Analysis',
        retrieve_client_list: 'Client List Lookup',
        retrieve_client_portfolio: 'Portfolio Data Lookup',
        calculate_ltv: 'Loan Calculations',
        tavily_search: 'Web Search Results',
        plot_line_from_lists: 'Line Chart',
        plot_pie_from_lists: 'Pie Chart',
        plot_bar_from_lists: 'Bar Chart',
        unknown_tool: 'Tool Output',
    }
    return nameMap[internalName] || 'Tool Output'
}
```

**NEW: No hardcoded mappings - package is domain-agnostic**

```typescript
// NEW: Package doesn't include any tool name mappings
// The IStreamEvent simply passes through the tool_name from your backend
// If you need friendly names, handle it in your own code

interface IStreamEvent {
  type: 'llm_token' | 'tool_start' | 'tool_end' | 'error'
  tool_name?: string  // Raw name from backend
  output?: string     // Tool result
  // ...
}

// Your backend can send whatever tool_name makes sense for your use case
// No assumptions about "review_news" or "calculate_ltv" etc.
```

### 2. Tool Renderers

**OLD: Hardcoded renderer map with heavy dependencies**

```typescript
// OLD: ToolRenderers/index.tsx - Fixed list bundled in package
import { PieChartRenderer } from './PieChartRenderer'      // Uses ECharts (~1MB)
import { LineChartRenderer } from './LineChartRenderer'    // Uses ECharts
import { BarChartRenderer } from './BarChartRenderer'      // Uses Plotly (~3.5MB)
import { NewsAnalysisRenderer } from './NewsAnalysisRenderer'
import { ClientListRenderer } from './ClientListRenderer'
import { PortfolioRenderer } from './PortfolioRenderer'
import { LtvCalculationRenderer } from './LtvCalculationRenderer'
import { WebSearchRenderer } from './WebSearchRenderer'

const TOOL_RENDERER_MAP: Record<string, ToolRendererComponent> = {
    plot_pie_from_lists: PieChartRenderer,
    plot_line_from_lists: LineChartRenderer,
    plot_bar_from_lists: BarChartRenderer,
    review_news: NewsAnalysisRenderer,
    retrieve_client_list: ClientListRenderer,
    retrieve_client_portfolio: PortfolioRenderer,
    calculate_ltv: LtvCalculationRenderer,
    tavily_search: WebSearchRenderer,
}
// Users CANNOT add, remove, or modify these
// ~5MB of chart libraries bundled whether used or not
```

**NEW: No built-in tool renderers - clean and minimal**

```typescript
// NEW: Package doesn't bundle any tool renderers
// Tool events (tool_start, tool_end) are processed by the hook
// But the package focuses on text streaming - it's up to the user
// to handle tool outputs in their app if needed

// The standard IStreamEvent format includes tool events:
interface IStreamEvent {
  type: 'llm_token' | 'tool_content' | 'tool_start' | 'tool_end' | 'error'
  content?: string
  tool_name?: string
  output?: string  // Tool result as JSON string
  // ...
}

// Users who need custom tool rendering can:
// 1. Process tool events in their own code
// 2. Build their own tool renderer components
// 3. Use whatever chart/table library they prefer
```

### 3. Tool Display Behavior

**OLD: Complex toggle buttons and visibility rules**

```typescript
// OLD: toolUtils.ts - Complex visibility logic
export const INLINE_TOOL_NAMES = [
    'plot_pie_from_lists',
    'plot_line_from_lists', 
    'plot_bar_from_lists',
    'retrieve_client_portfolio',
] as const

export const HIDDEN_TOOL_NAMES = ['retrieve_client_list'] as const

// Toggle buttons to show/hide tool outputs
// Some tools inline, some in collapsible sections
// Complex state management for visibility
```

**NEW: Simple - all tools render inline by default**

```typescript
// NEW: No toggle buttons, no visibility complexity
// Tool outputs simply appear inline in the chat flow
// Between LLM text tokens, exactly where they occur

// The hook processes events in order:
// 1. llm_token → renders text
// 2. tool_start → (internal tracking)
// 3. tool_end → tool output appears inline
// 4. llm_token → more text continues after tool

// Users implement their own tool rendering if needed
// No built-in toggle buttons or hidden tools concept
```

### 4. Backend Event Format

**OLD: Assumes Pulse8 backend returns exact format**

```typescript
// OLD: Users MUST make their backend return this exact format
interface IStreamEvent {
    type: 'llm_token' | 'tool_content' | 'tool_start' | 'tool_end' | 'error'
    content?: string
    tool_name?: string
    output?: string
    message?: string
    title?: string
    input?: string
}

// Backend response MUST be:
// data: {"type": "llm_token", "content": "Hello"}
// data: {"type": "tool_start", "tool_name": "review_news"}
// data: {"type": "tool_end", "tool_name": "review_news", "output": "..."}
```

**NEW: Adapter pattern supports any format**

```typescript
// NEW: User writes adapter to transform THEIR format
const myBackendAdapter = (raw: unknown): IStreamEvent | null => {
  const event = raw as MyBackendEvent
  
  switch (event.eventType) {
    case 'TEXT_CHUNK':
      return { type: 'llm_token', content: event.text }
    case 'FUNCTION_CALL':
      return { type: 'tool_start', tool_name: event.functionName }
    case 'FUNCTION_RESULT':
      return { type: 'tool_end', tool_name: event.functionName, output: event.result }
    default:
      return null
  }
}

// Or use pre-built adapters for common providers
import { createOpenAIAdapter, createAnthropicAdapter, createGeminiAdapter } from '@pulse8-ai/chat'

await streamSSE({
  url: 'https://api.openai.com/v1/chat/completions',
  adapter: createOpenAIAdapter(),  // Handles OpenAI format automatically
  onEvent: params.onEvent,
  onComplete: params.onComplete,
  onError: params.onError,
})
```

### 5. Package Dependencies

**OLD: Heavy dependencies always bundled**

```json
{
  "peerDependencies": {
    "echarts": "^6.0.0",
    "echarts-for-react": "^3.0.5",
    "plotly.js": "^3.1.1",
    "react-plotly.js": "^2.6.0",
    "@tanstack/react-table": "^8.21.3"
  }
}
```

Bundle size impact: **~5MB** of chart/table libraries bundled even if not used.

**NEW: Minimal dependencies, bring your own**

```json
{
  "dependencies": {
    "uuid": "^9.0.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "@heroicons/react": "^2.0.0",
    "clsx": "^2.0.0"
  }
}
```

Bundle size impact: **~200KB** - users add only the chart libraries they actually need.

### 6. Icons/Branding

**OLD: K8 branding hardcoded**

```typescript
// OLD: index.ts - Only K8Icon available
export { K8Icon, StopCircleIcon, MicIcon } from './assets'

// K8Icon is Pulse8's branded icon - cannot be changed
```

**NEW: Generic icon with full customization**

```typescript
// NEW: index.ts - Generic AssistantIcon
export { AssistantIcon, StopCircleIcon, MicIcon } from './assets'

// User can override with their own branding
<ChatConfigProvider config={{
  icons: {
    assistant: MyCompanyBotIcon,
    stop: MyStopIcon,
    mic: MyMicIcon,
  }
}}>
  <ChatPanel {...props} />
</ChatConfigProvider>
```

## Full Usage Comparison

### OLD: Internal Project Setup

```tsx
import { ChatPanel, useChatMessages, K8Icon } from '@pulse8-ai/chat'
import '@pulse8-ai/chat/styles.css'
import { chatService } from './pulse8-api'

function ChatPage() {
  const [threadId] = useState(() => uuidv4())
  
  const { messages, isStreaming, sendMessage, stopStreaming } = useChatMessages({
    sendMessageToApi: async (params) => {
      // MUST call Pulse8 backend that returns exact format
      await chatService.sendMessage(
        threadId,
        {
          user_input: params.userInput,
          pdf_uuids: params.pdfUuids,
          model_name: params.modelName,
        },
        params.onEvent,
        params.onComplete,
        params.onError,
        params.abortSignal,
      )
    },
  })

  return (
    <div className="h-screen">
      <ChatPanel
        messages={messages}
        isStreaming={isStreaming}
        onSendMessage={(msg) => sendMessage(msg, 'claude-sonnet-4')}
        onStopStreaming={stopStreaming}
        emptyStateTitle="Hi, I'm K8 👋🏻"
      />
    </div>
  )
}

// Problems:
// ❌ Tool renderers cannot be customized
// ❌ Tool names cannot be changed
// ❌ Only works with Pulse8 backend
// ❌ K8 branding only
// ❌ ~5MB of unused chart libraries bundled
```

### NEW: Any Project Setup

```tsx
import { 
  ChatPanel, 
  ChatConfigProvider,
  useChatMessages,
  streamSSE,
  createOpenAIAdapter,
} from '@pulse8-ai/chat'
import '@pulse8-ai/chat/styles.css'

// Optional: User can provide custom icon
import { MyCompanyIcon } from './assets/MyCompanyIcon'

const chatConfig = {
  icons: {
    assistant: MyCompanyIcon, // Optional custom branding
  },
}

function ChatPage() {
  const { messages, isStreaming, sendMessage, stopStreaming } = useChatMessages({
    sendMessageToApi: async (params) => {
      // Works with ANY backend via adapters
      await streamSSE({
        url: '/api/chat',
        body: { message: params.userInput, model: 'gpt-4' },
        adapter: createOpenAIAdapter(),
        onEvent: params.onEvent,
        onComplete: params.onComplete,
        onError: params.onError,
        signal: params.abortSignal,
      })
    },
  })

  return (
    <ChatConfigProvider config={chatConfig}>
      <div className="h-screen">
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          onSendMessage={(msg) => sendMessage(msg, 'gpt-4')}
          onStopStreaming={stopStreaming}
          emptyStateTitle="How can I help you today?"
        />
      </div>
    </ChatConfigProvider>
  )
}

// Benefits:
// ✅ Works with OpenAI, Anthropic, Gemini, or custom backends
// ✅ Tools always show inline (simple, no toggle buttons)
// ✅ Custom branding via icons config
// ✅ Minimal bundle size (~200KB)
// ✅ No heavy chart/table libraries bundled
```

## Summary: What Changed

| Feature | OLD (Internal) | NEW (Public) |
|---------|----------------|--------------|
| Tool renderers | ❌ 8 hardcoded | ✅ User provides their own |
| Tool names | ❌ 8 hardcoded mappings | ✅ User handles in renderers |
| Tool display | ❌ Toggle buttons, complex visibility | ✅ Always inline (simple) |
| Backend format | ❌ Pulse8 only | ✅ Any (via adapters) |
| Pre-built adapters | ❌ None | ✅ OpenAI, Anthropic, Gemini |
| Streaming utilities | ❌ None | ✅ streamSSE, parseSSELine |
| Icons | ❌ K8 only | ✅ Customizable |
| Dependencies | ❌ ~5MB bundled | ✅ ~200KB minimal |
| Target users | ❌ Internal only | ✅ Anyone |

## Why This Matters

The new architecture enables:

1. **Any developer** can use the package, not just internal teams
2. **Any AI backend** is supported through the adapter pattern
3. **Smaller bundle sizes** since heavy libraries aren't bundled (~5MB → ~200KB)
4. **Simpler mental model** - tools always render inline, no toggle buttons or visibility rules
5. **Full customization** of branding and theming
6. **Better maintainability** since domain logic lives in user's app, not the library
