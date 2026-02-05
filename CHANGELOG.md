# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-02-05

### Added

- **Simplified Streaming API** - Internal handle for `streamSSE` via `streamConfig` option in `useChatMessages` hook.
- **Provider Helpers** - Out-of-the-box configurations for OpenAI, Anthropic Claude, and Google Gemini (`openAIStreamConfig`, etc.).
- **Message Animations** - Sleek `fadeInUp` animation for appended messages for a premium feel.
- **Detailed Documentation** - Refactored guides including a new dedicated [Advanced Streaming](docs/STREAMING.md) guide.
- URL sanitization for markdown links to prevent XSS attacks.
- Safe JSON parsing with size and depth limits (`safeJsonParse`, etc.).
- Comprehensive ARIA labels and accessibility attributes across all components.
- `ErrorBoundary` and `MessageErrorBoundary` components for graceful error handling.

### Changed

- Simplified README focused on high-level APIs.
- Enhanced `parseSSELine` with configurable JSON security limits.
- Improved keyboard navigation and screen reader support.
- Added `nofollow` attribute to external links for SEO protection.

### Security

- Added protection against XSS via malicious URLs.
- Added protection against DoS via large JSON payloads.
- Added protection against stack overflow via deeply nested JSON.

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

[0.3.0]: https://github.com/pulse8-ai/pulse8-ai-chat/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/pulse8-ai/pulse8-ai-chat/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/pulse8-ai/pulse8-ai-chat/releases/tag/v0.1.0
