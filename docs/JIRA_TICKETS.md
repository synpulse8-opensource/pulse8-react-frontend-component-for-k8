# JIRA Ticket Breakdown: Public Chat Package Refactor

This document outlines the JIRA tickets for transforming `@pulse8-ai/chat` from an internal package to a public npm package.

---

## Epic: Public Chat Package v0.2.0

**Epic Summary:** Transform the internal chat UI package into a generic, customizable public npm package that works with any AI backend.

**Labels:** `chat-package`, `public-release`, `refactor`

---

## Story 1: Configuration Context System

**Summary:** Implement ChatConfigProvider context for package configuration

**Description:**
Create a React Context-based configuration system that allows users to:
- Register custom tool renderers
- Configure event adapters for different backend formats
- Set tool name mappings
- Configure inline/hidden tools
- Override default icons

**Acceptance Criteria:**
- [ ] `ChatConfigProvider` component created
- [ ] `useChatConfig` hook implemented
- [ ] Default configuration values defined
- [ ] Context works outside provider (graceful fallback)
- [ ] TypeScript types exported for `IChatConfig`

**Story Points:** 5

**Sub-tasks:**
1. Create `src/context/ChatConfigContext.tsx`
2. Define `IChatConfig` interface
3. Implement `ChatConfigProvider` component
4. Implement `useChatConfig` hook
5. Add default event adapter
6. Create context index exports

---

## Story 2: Remove Domain-Specific Tool Renderers

**Summary:** Remove all internal domain-specific tool renderers

**Description:**
Remove tool renderers that are specific to internal use cases:
- NewsAnalysisRenderer
- ClientListRenderer
- PortfolioRenderer
- LtvCalculationRenderer
- WebSearchRenderer
- PieChartRenderer, LineChartRenderer, BarChartRenderer

Keep only the generic `DefaultRenderer` as fallback.

**Acceptance Criteria:**
- [ ] All domain-specific renderers deleted
- [ ] DefaultRenderer updated with theme support
- [ ] No broken imports
- [ ] Package builds successfully

**Story Points:** 3

**Sub-tasks:**
1. Delete domain-specific renderer files
2. Update DefaultRenderer with theme support
3. Update ToolRenderers index exports
4. Remove tableConfigs.tsx

---

## Story 3: Abstract Chart Data Types

**Summary:** Create abstract type definitions for chart data

**Description:**
Define generic chart data interfaces that users can implement with their preferred chart library (ECharts, Chart.js, Plotly, Recharts, etc.).

**Acceptance Criteria:**
- [ ] `IChartData` interface defined
- [ ] `IChartRendererProps` interface defined
- [ ] `parseChartData` helper function implemented
- [ ] Types exported from package

**Story Points:** 2

**Sub-tasks:**
1. Create `src/types/chart.ts`
2. Define chart data interfaces
3. Implement parse helper
4. Update types index exports

---

## Story 4: Event Adapter Pattern

**Summary:** Implement event adapter pattern for backend flexibility

**Description:**
Allow users to transform any backend event format to the standard `IStreamEvent` format via adapter functions.

**Acceptance Criteria:**
- [ ] `defaultEventAdapter` function exported
- [ ] `useChatMessages` accepts custom adapter
- [ ] Adapter can return `null` to skip events
- [ ] Backward compatible with existing format

**Story Points:** 5

**Sub-tasks:**
1. Define adapter function signature
2. Implement default adapter
3. Update useChatMessages to use adapter
4. Add toolNameMapping support to hook
5. Add inlineTools support to hook

---

## Story 5: Context-Based Tool Registry

**Summary:** Refactor ToolRenderer to use context-based registry

**Description:**
Update ToolRenderer to look up custom renderers from ChatConfigProvider context, falling back to DefaultRenderer when no custom renderer is registered.

**Acceptance Criteria:**
- [ ] ToolRenderer uses useChatConfig
- [ ] Custom renderers from config take precedence
- [ ] DefaultRenderer used as fallback
- [ ] Theme properly passed to renderers

**Story Points:** 3

**Sub-tasks:**
1. Update ToolRenderer component
2. Update ToolRendererProps types
3. Update component exports

---

## Story 6: Update Tool Utility Functions

**Summary:** Make toolUtils functions config-aware

**Description:**
Update `isInlineTool`, `isHiddenTool`, and `isToolVisibleByDefault` functions to accept configuration parameters instead of using hardcoded values.

**Acceptance Criteria:**
- [ ] Functions accept config parameters
- [ ] No hardcoded tool names
- [ ] AssistantMessage uses config
- [ ] MessageContentRenderer uses config

**Story Points:** 3

**Sub-tasks:**
1. Update toolUtils.ts signatures
2. Update AssistantMessage component
3. Update MessageContentRenderer component
4. Remove hardcoded tool name constants

---

## Story 7: Remove Internal Branding

**Summary:** Replace K8Icon with generic AssistantIcon

**Description:**
Create a generic AssistantIcon as the default, keep K8Icon as deprecated alias for backward compatibility, and allow icon override via config.

**Acceptance Criteria:**
- [ ] Generic AssistantIcon created
- [ ] K8Icon marked as deprecated
- [ ] Icons configurable via ChatConfigProvider
- [ ] Assets index updated

**Story Points:** 2

**Sub-tasks:**
1. Create AssistantIcon component
2. Update assets index exports
3. Add deprecation comment to K8Icon

---

## Story 8: Update Package Exports

**Summary:** Update index.ts with new exports

**Description:**
Update the main package exports to include new context, types, adapters, and organized sections.

**Acceptance Criteria:**
- [ ] Context exports added
- [ ] Chart types exported
- [ ] Event adapter exported
- [ ] Tool renderer types exported
- [ ] All exports documented

**Story Points:** 2

**Sub-tasks:**
1. Reorganize index.ts exports
2. Add section comments
3. Export new types and functions

---

## Story 9: Remove Heavy Dependencies

**Summary:** Remove echarts, plotly, and tanstack-table from dependencies

**Description:**
Remove heavy visualization dependencies since users will bring their own chart/table libraries. Delete Chart and Table UI components.

**Acceptance Criteria:**
- [ ] echarts removed from dependencies
- [ ] plotly.js removed from dependencies
- [ ] @tanstack/react-table removed from dependencies
- [ ] Chart UI component deleted
- [ ] Table UI component deleted
- [ ] Package size significantly reduced

**Story Points:** 3

**Sub-tasks:**
1. Remove packages from dependencies
2. Delete Chart component
3. Delete Table component
4. Update UI index exports
5. Update types index (remove ExtendedColumnDef)

---

## Story 10: Update Documentation

**Summary:** Rewrite README for public users

**Description:**
Comprehensive documentation rewrite covering:
- Installation and setup
- Configuration with ChatConfigProvider
- Custom tool renderer creation
- Event adapter pattern
- Theming guide
- Migration from v0.1.x

**Acceptance Criteria:**
- [ ] Quick start guide updated
- [ ] Configuration documented
- [ ] Custom tool renderer examples
- [ ] Event adapter examples
- [ ] Theme customization guide
- [ ] Migration guide from v0.1.x
- [ ] API reference complete

**Story Points:** 5

**Sub-tasks:**
1. Update installation section
2. Write configuration documentation
3. Write custom renderer guide
4. Write event adapter documentation
5. Write theming guide
6. Write migration guide

---

## Story 11: Internal Migration

**Summary:** Migrate internal apps to use new public package API

**Description:**
Update `pulse8-ai-frontend/packages/chat` and internal apps to:
- Use ChatConfigProvider
- Register internal tool renderers
- Configure event adapters if needed

**Acceptance Criteria:**
- [ ] Internal package updated
- [ ] All internal apps working
- [ ] No regressions in functionality
- [ ] Internal renderers moved to separate package/file

**Story Points:** 8

**Sub-tasks:**
1. Create internal tool renderers package/file
2. Update internal package to use ChatConfigProvider
3. Register internal renderers
4. Test all internal applications
5. Update internal documentation

---

## Summary

| Story | Points | Priority |
|-------|--------|----------|
| Configuration Context System | 5 | High |
| Remove Domain-Specific Renderers | 3 | High |
| Abstract Chart Data Types | 2 | Medium |
| Event Adapter Pattern | 5 | High |
| Context-Based Tool Registry | 3 | High |
| Update Tool Utility Functions | 3 | Medium |
| Remove Internal Branding | 2 | Low |
| Update Package Exports | 2 | Medium |
| Remove Heavy Dependencies | 3 | High |
| Update Documentation | 5 | High |
| Internal Migration | 8 | High |

**Total Story Points:** 41

**Suggested Sprint Allocation:**
- Sprint 1: Stories 1, 2, 4, 5 (16 points) - Core refactoring
- Sprint 2: Stories 3, 6, 8, 9 (10 points) - Cleanup and optimization
- Sprint 3: Stories 7, 10, 11 (15 points) - Documentation and migration
