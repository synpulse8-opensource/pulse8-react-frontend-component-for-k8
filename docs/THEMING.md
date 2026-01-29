# Theming

Customize the visual appearance with partial theme overrides.

## Basic Usage

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

## Available Theme Properties

### Primary Colors
- `primary` - Main brand color
- `primaryHover` - Hover state for primary elements
- `primaryLight` - Light variant of primary color

### Backgrounds
- `background` - Main background color
- `backgroundSecondary` - Secondary background (cards, panels)
- `backgroundTertiary` - Tertiary background (nested elements)

### Text
- `text` - Primary text color
- `textSecondary` - Secondary text (descriptions, labels)
- `textTertiary` - Tertiary text (placeholders, hints)
- `textMuted` - Muted text (disabled states)

### Messages
- `userMessageBg` - User message background
- `userMessageGradientFrom` - Gradient start for user messages
- `userMessageGradientVia` - Gradient middle for user messages
- `userMessageGradientTo` - Gradient end for user messages
- `assistantMessageBg` - Assistant message background
- `assistantMessageText` - Assistant message text color

### Buttons
- `buttonPrimary` - Primary button background
- `buttonPrimaryHover` - Primary button hover state
- `buttonSecondary` - Secondary button background

### Inputs
- `inputBg` - Input field background
- `inputBorder` - Input field border
- `inputFocusBorder` - Input field focus border

### Charts
- `chartColors[]` - Array of colors for chart series
- `chartGridLine` - Chart grid line color
- `chartAxis` - Chart axis color

### Status
- `success` - Success state color
- `error` - Error state color
- `warning` - Warning state color
- `info` - Info state color

### UI Elements
- `codeBlockBg` - Code block background
- `tableHeaderBg` - Table header background
- `toolContainerBg` - Tool output container background

## Dark Mode Example

```tsx
const darkTheme: Partial<ChatTheme> = {
  colors: {
    background: '#0f0f0f',
    backgroundSecondary: '#1a1a1a',
    backgroundTertiary: '#252525',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    textMuted: '#666666',
    primary: '#3b82f6',
    assistantMessageBg: '#1a1a1a',
    userMessageGradientFrom: '#1e40af',
    userMessageGradientTo: '#7c3aed',
  },
}
```

## Light Mode Example

```tsx
const lightTheme: Partial<ChatTheme> = {
  colors: {
    background: '#ffffff',
    backgroundSecondary: '#f5f5f5',
    backgroundTertiary: '#e5e5e5',
    text: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',
    primary: '#2563eb',
    assistantMessageBg: '#f5f5f5',
    userMessageGradientFrom: '#3b82f6',
    userMessageGradientTo: '#8b5cf6',
  },
}
```
