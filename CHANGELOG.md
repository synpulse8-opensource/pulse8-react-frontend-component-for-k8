# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- URL sanitization for markdown links to prevent XSS attacks
- Safe JSON parsing with size and depth limits (`safeJsonParse`, `DEFAULT_MAX_JSON_SIZE`, `DEFAULT_MAX_JSON_DEPTH`)
- Comprehensive ARIA labels and accessibility attributes across all components
- `ErrorBoundary` and `MessageErrorBoundary` components for graceful error handling
- JSDoc documentation for all public APIs
- LICENSE file (MIT)
- CHANGELOG.md for version tracking
- CONTRIBUTING.md with contribution guidelines
- Security documentation section in README
- Accessibility documentation section in README
- Troubleshooting guide in README

### Changed

- Enhanced `parseSSELine` with configurable JSON security limits
- Improved keyboard navigation and screen reader support
- Added `nofollow` attribute to external links for SEO protection

### Security

- Added protection against XSS via malicious URLs (javascript:, data: protocols blocked)
- Added protection against DoS via large JSON payloads (1MB default limit)
- Added protection against stack overflow via deeply nested JSON (100 levels default limit)

## [0.2.0] - 2025-01-15

### Added

- Pre-built adapters for OpenAI, Anthropic Claude, and Google Gemini
- Streaming utilities (`streamSSE`, `parseSSELine`, `createSSEParser`)
- Event adapter pattern for custom backend integration
- `ChatConfigProvider` for centralized configuration
- Model selection support via `useModelSelection` hook and `ModelSelector` component
- Subpath exports for tree-shaking (`@pulse8-ai/chat/adapters`, `@pulse8-ai/chat/utils`, `@pulse8-ai/chat/ui`)

### Changed

- Simplified integration - much less boilerplate for common backends
- Improved TypeScript types and exports

### Breaking Changes

- Removed built-in Chart and Table components from core package
- Tool renderers must now be registered via `ChatConfigProvider`
- `K8Icon` deprecated in favor of `AssistantIcon`

## [0.1.0] - 2025-01-01

### Added

- Initial release
- Core chat components (`ChatPanel`, `ChatContainer`, `ChatInput`, etc.)
- Message rendering with Markdown support
- PDF upload support
- Theming system with customizable colors
- TypeScript support with exported types

[Unreleased]: https://github.com/pulse8-ai/pulse8-ai-chat/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/pulse8-ai/pulse8-ai-chat/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/pulse8-ai/pulse8-ai-chat/releases/tag/v0.1.0
