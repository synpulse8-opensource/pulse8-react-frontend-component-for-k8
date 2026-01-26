# Internal News: @pulse8-ai/chat Goes Public

**Date:** January 2026  
**Author:** Engineering Team  
**Category:** Product Release

---

## TL;DR

We've refactored our internal chat UI package (`@pulse8-ai/chat`) into a public npm package that anyone can use to build AI chat interfaces. Version 0.2.0 introduces a plugin-based architecture with custom tool renderers, backend adapters, and full theming support.

---

## What Changed

### The Big Picture

Our chat UI package started as an internal tool, tightly coupled with our specific backend and tools (news analysis, client portfolios, LTV calculations, etc.). We've now transformed it into a generic, customizable package that:

1. **Works with any AI backend** - OpenAI, Anthropic, custom APIs
2. **Supports custom tool renderers** - Bring your own chart/table libraries
3. **Reduces bundle size** - Removed ~4.5MB of chart dependencies
4. **Maintains our internal functionality** - Via configuration, not hardcoding

### Key Technical Changes

| Area | Before | After |
|------|--------|-------|
| Tool Renderers | Hardcoded (NewsAnalysis, Charts, etc.) | Plugin registry via `ChatConfigProvider` |
| Backend Format | Our specific event format | Adapter pattern for any format |
| Dependencies | ECharts, Plotly, TanStack Table (~4.5MB) | User provides their own |
| Branding | K8 icon hardcoded | Generic icon, customizable |
| Configuration | Props only | Context-based `ChatConfigProvider` |

---

## Why We Did This

### External Value

1. **Community Contribution** - Our chat UI is production-tested and polished
2. **Developer Experience** - Fill a gap for customizable AI chat UIs
3. **Brand Visibility** - Position Pulse8 as an AI tooling leader

### Internal Benefits

1. **Cleaner Architecture** - Separation of concerns between UI and business logic
2. **Easier Maintenance** - Core package is simpler, domain logic is isolated
3. **Flexibility** - Can swap implementations without changing the core

---

## Lessons Learned

### 1. Start Generic, Add Specifics Later

**What we learned:** Building domain-specific features directly into a library creates tight coupling that's painful to undo.

**Better approach:** Build the generic framework first, then add domain features as plugins/extensions that users (including ourselves) can opt into.

### 2. Dependencies Have Hidden Costs

**What we learned:** Chart libraries are HUGE. ECharts alone is ~1MB minified. Plotly is ~3.5MB.

**Better approach:** Don't bundle visualization libraries. Let users choose their preferred library and provide adapter interfaces.

### 3. Context > Props for Configuration

**What we learned:** Passing configuration through props leads to prop drilling through many component layers.

**Better approach:** Use React Context for configuration that many components need. Components can access config with a hook (`useChatConfig`).

### 4. Adapter Pattern for Integration

**What we learned:** Different backends have different event formats. Supporting multiple formats directly creates complexity.

**Better approach:** Define a standard internal format and let users write adapters to transform their backend's format. Simple, flexible, maintainable.

### 5. Deprecate, Don't Delete

**What we learned:** Breaking changes hurt adoption and create migration pain.

**Better approach:** Keep old APIs working (deprecated) while introducing new ones. This allows gradual migration.

---

## Migration Guide for Internal Teams

### Step 1: Install Internal Renderers Package

We've moved our domain-specific renderers to a separate internal package:

```bash
# The internal renderers are now in pulse8-ai-frontend
# Import from the internal package
```

### Step 2: Update Your App

Wrap your chat components with `ChatConfigProvider`:

```tsx
import { ChatPanel, ChatConfigProvider } from '@pulse8-ai/chat'
import { 
  NewsAnalysisRenderer,
  ClientListRenderer,
  PortfolioRenderer,
  ChartRenderer,
} from '@pulse8-ai/internal-chat-tools' // Our internal package

const chatConfig = {
  toolRenderers: {
    'review_news': NewsAnalysisRenderer,
    'retrieve_client_list': ClientListRenderer,
    'retrieve_client_portfolio': PortfolioRenderer,
    'plot_line_from_lists': ChartRenderer,
    'plot_bar_from_lists': ChartRenderer,
    'plot_pie_from_lists': ChartRenderer,
    'calculate_ltv': LtvCalculationRenderer,
    'tavily_search': WebSearchRenderer,
  },
  toolNameMapping: {
    'review_news': 'News Impact Analysis',
    'retrieve_client_list': 'Client List Lookup',
    'retrieve_client_portfolio': 'Portfolio Data Lookup',
    'calculate_ltv': 'Loan Calculations',
    'tavily_search': 'Web Search Results',
    'plot_line_from_lists': 'Line Chart',
    'plot_pie_from_lists': 'Pie Chart',
    'plot_bar_from_lists': 'Bar Chart',
  },
  inlineTools: [
    'plot_pie_from_lists',
    'plot_line_from_lists',
    'plot_bar_from_lists',
    'retrieve_client_portfolio',
  ],
  hiddenTools: ['retrieve_client_list'],
}

function App() {
  return (
    <ChatConfigProvider config={chatConfig}>
      <YourChatPage />
    </ChatConfigProvider>
  )
}
```

### Step 3: Update Icon References

If you're using K8Icon directly:

```tsx
// Before
import { K8Icon } from '@pulse8-ai/chat'

// After (recommended)
import { AssistantIcon } from '@pulse8-ai/chat'

// Or keep using K8Icon (deprecated but still works)
import { K8Icon } from '@pulse8-ai/chat' // Shows deprecation warning
```

### Step 4: Update Chart/Table Imports

If you were importing Chart or Table from the package:

```tsx
// Before
import { Chart, Table } from '@pulse8-ai/chat'

// After - use your own implementations
import ReactECharts from 'echarts-for-react'
import { useReactTable } from '@tanstack/react-table'
```

---

## What's Next

### Short Term

1. **Internal Migration** - All internal apps migrated to v0.2.0
2. **Documentation Polish** - Improve examples and tutorials
3. **Community Feedback** - Monitor GitHub issues and discussions

### Medium Term

1. **Plugin Ecosystem** - Consider `@pulse8-ai/chat-plugins` for common tool renderers
2. **Accessibility Improvements** - WCAG 2.1 compliance
3. **Server Components** - React Server Components support

### Long Term

1. **Voice Integration** - Built-in speech-to-text support
2. **Multi-modal** - Image/video in messages
3. **Collaboration** - Multi-user chat support

---

## Resources

- **GitHub Repository:** github.com/pulse8-ai/pulse8-ai-chat
- **npm Package:** @pulse8-ai/chat
- **Documentation:** README.md in the repo
- **Internal Confluence:** [Link to planning doc]
- **JIRA Epic:** [Link to epic]

---

## Questions?

Reach out in the #engineering Slack channel or contact the platform team directly.

---

## Acknowledgments

Thanks to everyone who contributed to this refactor:
- Architecture design and implementation
- Documentation and testing
- Code review and feedback

This is a significant milestone in making our internal tools valuable to the broader developer community!
