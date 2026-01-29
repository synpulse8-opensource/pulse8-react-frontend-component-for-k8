# Accessibility

This package is designed with accessibility in mind, following WCAG 2.1 guidelines.

## Features

- **ARIA Labels**: All interactive elements have proper ARIA labels
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Semantic HTML and ARIA live regions for dynamic content
- **Focus Management**: Proper focus indicators and focus trapping in modals

## Component Accessibility

| Component | Features |
|-----------|----------|
| `ChatContainer` | `role="log"`, `aria-live="polite"`, keyboard scrollable |
| `ChatInput` | Labeled input, button descriptions, menu accessibility |
| `Message` | `role="listitem"`, `aria-busy` for streaming |
| `ErrorBoundary` | `role="alert"`, `aria-live="assertive"` |

## Usage Tips

```tsx
// The chat container supports keyboard navigation
<ChatPanel
  messages={messages}
  // ... other props
/>

// Screen readers will announce new messages automatically
// due to aria-live="polite" on the message container
```

## Testing Accessibility

We recommend testing with:
- **VoiceOver** (macOS)
- **NVDA** (Windows)
- **axe DevTools** browser extension
- **Lighthouse** accessibility audit
