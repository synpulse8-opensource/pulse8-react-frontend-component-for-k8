# Contributing to @pulse8-ai/chat

Thank you for your interest in contributing to @pulse8-ai/chat! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pulse8-ai-chat.git
   cd pulse8-ai-chat
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/pulse8-ai/pulse8-ai-chat.git
   ```

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint

# Start Storybook for component development
npm run storybook
```

### Project Structure

```
src/
├── adapters/       # Pre-built adapters for AI providers
├── assets/         # Icons and static assets
├── components/     # React components
│   ├── ChatPanel/
│   ├── ChatInput/
│   ├── Message/
│   └── ...
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── theme/          # Theme configuration
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-component` - For new features
- `fix/streaming-error` - For bug fixes
- `docs/update-readme` - For documentation changes
- `refactor/improve-types` - For code refactoring

### Commit Messages

Follow conventional commit format:
- `feat: add new feature`
- `fix: resolve bug in component`
- `docs: update documentation`
- `refactor: improve code structure`
- `test: add unit tests`
- `chore: update dependencies`

## Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit them with clear messages

3. **Update documentation** if your changes affect the public API

4. **Run all checks** before submitting:
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

5. **Push your branch** and create a Pull Request

6. **Fill out the PR template** with:
   - Description of changes
   - Related issues (if any)
   - Screenshots for UI changes
   - Breaking changes (if any)

7. **Address review feedback** promptly

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Export types for all public APIs
- Use interfaces for object shapes (prefix with `I`)
- Add JSDoc comments for public APIs

```typescript
/**
 * Props for the MyComponent component.
 * @example
 * ```tsx
 * <MyComponent value="hello" onChange={handleChange} />
 * ```
 */
export interface IMyComponentProps {
    /** The current value */
    value: string
    /** Callback when value changes */
    onChange: (value: string) => void
}
```

### React Components

- Use functional components with hooks
- Export component types
- Follow the single responsibility principle
- Use proper ARIA attributes for accessibility

```tsx
export const MyComponent: React.FC<IMyComponentProps> = ({ value, onChange }) => {
    return (
        <div role="textbox" aria-label="Input field">
            {/* ... */}
        </div>
    )
}

export type { IMyComponentProps } from './types'
```

### Styling

- Use Tailwind CSS classes
- Support theming via the theme prop
- Use CSS variables for dynamic values
- Ensure responsive design

### Security

- Sanitize all user-generated content
- Validate URLs before rendering links
- Use safe JSON parsing for untrusted data
- Follow OWASP security guidelines

### Accessibility

- Add ARIA labels to interactive elements
- Ensure keyboard navigation works
- Provide screen reader support
- Test with accessibility tools

## Testing

Currently, we encourage manual testing with Storybook:

```bash
npm run storybook
```

When adding new components:
1. Create a `.stories.tsx` file in the component directory
2. Add stories covering different states and props
3. Test keyboard navigation
4. Verify screen reader compatibility

## Documentation

- Update README.md for public API changes
- Add JSDoc comments to new functions/components
- Include usage examples in documentation
- Update CHANGELOG.md for notable changes

### Documentation Style

- Use clear, concise language
- Provide code examples
- Document all props and options
- Include common use cases

## Questions?

If you have questions, please open an issue on GitHub or reach out to the maintainers.

Thank you for contributing! 🎉
