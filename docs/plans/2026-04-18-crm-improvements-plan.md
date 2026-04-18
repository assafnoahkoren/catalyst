# Plan: CRM Feature Improvements Research

**Design doc:** docs/plans/2026-04-18-crm-design.md
**Created:** 2026-04-18
**Status:** pending

## Objective

For each CRM module, investigate best practices from leading products (Monday.com, HubSpot, Pipedrive, Intercom, ManyChat, Crisp) and UX research sources. Analyze our current code implementation. Produce a prioritized improvement list per module.

## Methodology per task

1. **Code Review** — Read our current implementation, identify gaps and rough edges
2. **Competitive Research** — Study 2-3 competitors for this feature area (web search)
3. **UX Best Practices** — Research UX patterns and guidelines for this feature type
4. **Write Improvements** — Document findings as a prioritized list in `docs/improvements/<module>.md`

---

## Tasks

### 1. Auth & Onboarding — Product Research

Review auth flow (register, login, onboarding). Compare with HubSpot/Monday.com onboarding. Research: progressive onboarding, first-time user experience, empty states. Check: password reset flow (missing), email verification, session management, redirect logic, error handling.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 2. Auth & Onboarding — UX Research

Analyze form design, validation feedback, loading states, error messages. Research: form UX best practices, accessibility (ARIA labels, focus management), mobile responsiveness. Check: keyboard navigation, autofill support, password strength indicator, social login options.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 3. Dashboard — Product Research

Review dashboard metrics and layout. Compare with HubSpot/Pipedrive dashboards. Research: which CRM metrics matter most, conversion rate calculation, time-series charts, real-time updates. Check: missing metrics (response time, bot vs human ratio, conversion rate), date range filters, data refresh strategy.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 4. Dashboard — UX Research

Analyze dashboard layout, card design, chart readability. Research: dashboard UX patterns (information hierarchy, progressive disclosure, data visualization best practices). Check: responsive layout, loading skeletons, empty state design, color accessibility for charts.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 5. Customer Kanban — Product Research

Review kanban implementation. Compare with Monday.com/Pipedrive kanban boards. Research: drag-and-drop UX in CRM, column limits (WIP limits), card information density, quick actions on cards. Check: missing features (add customer from kanban, quick edit, card preview, column collapse).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 6. Customer Kanban — UX Research

Analyze drag-and-drop feedback, card layout, column headers. Research: kanban UX patterns (drag affordance, drop target highlighting, animation, touch support). Check: mobile usability, horizontal scroll behavior, keyboard accessibility, performance with many cards.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 7. Customer Table — Product Research

Review table implementation. Compare with Monday.com/HubSpot table views. Research: CRM table features (inline editing, column resize, column reorder, frozen columns, bulk actions, export). Check: missing features (column visibility toggle, saved views/filters, row selection, bulk delete/assign/status change).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 8. Customer Table — UX Research

Analyze table layout, sort indicators, pagination UX. Research: data table UX best practices (sticky headers, row hover, zebra striping, responsive tables, empty/loading states). Check: filter UX (multi-filter, saved filters), search debounce, pagination vs infinite scroll, mobile table experience.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 9. Customer Detail — Product Research

Review customer detail page. Compare with HubSpot/Pipedrive contact detail pages. Research: CRM contact pages (360-degree view, related entities, communication history, deal association). Check: missing features (inline edit all fields, custom fields display, file attachments, email history, deal linkage).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 10. Customer Detail — UX Research

Analyze detail page layout, activity timeline, note form. Research: detail page UX (information architecture, tabbed vs scrolling layout, action placement, timeline design). Check: responsive layout, loading states, optimistic updates, form validation feedback, back navigation.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 11. Activity Timeline — Product Research

Review activity tracking and timeline. Compare with HubSpot/Intercom activity feeds. Research: CRM activity logging best practices (automatic vs manual, granularity, filtering, actor display). Check: missing activity types (email, call log, meeting), activity filtering, actor name resolution, relative timestamps.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 12. Activity Timeline — UX Research

Analyze timeline visual design, event cards, chronology. Research: timeline UX patterns (grouping by date, icons per type, expandable details, load more). Check: visual hierarchy, color coding by type, avatar/initials display, infinite scroll vs pagination.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 13. Notes — Product Research

Review notes implementation. Compare with HubSpot/Pipedrive notes. Research: CRM note features (rich text, mentions, pinning, categories, attachments). Check: missing features (rich text editor, @mentions, note pinning, note search, edit history).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 14. Notes — UX Research

Analyze note form, note display, create/edit flow. Research: note-taking UX (inline editing, auto-save, markdown support, character limits). Check: textarea auto-resize, save confirmation, delete confirmation, keyboard shortcuts.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 15. Conversations & Chat UI — Product Research

Review conversation system. Compare with Intercom/Crisp/Tidio chat interfaces. Research: CRM chat features (typing indicators, read receipts, media messages, canned responses, conversation assignment, SLA timers). Check: missing features (typing indicator, message status, media support, canned responses, conversation tagging).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 16. Conversations & Chat UI — UX Research

Analyze chat bubble layout, message input, conversation list. Research: chat UX patterns (message grouping, timestamp display, unread indicators, sound notifications, mobile chat UX). Check: message alignment, avatar display, link preview, emoji support, scroll-to-bottom, new message indicator.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 17. WhatsApp Bot & RAG — Product Research

Review bot flow and RAG pipeline. Compare with ManyChat/Tidio/Intercom bot builders. Research: chatbot UX best practices (greeting messages, fallback handling, handoff timing, conversation context limits). Check: confidence threshold tuning, multi-language bot responses, conversation memory limits, bot personality customization.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 18. WhatsApp Bot & RAG — UX Research

Analyze bot-to-human handoff, confidence thresholds, response quality. Research: conversational AI UX (transparency about bot identity, handoff messaging, escalation paths, user expectations). Check: handoff notification to team, bot response latency, conversation history display for agent taking over.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 19. Knowledge Base — Product Research

Review knowledge base management. Compare with Intercom/Zendesk knowledge bases. Research: RAG knowledge management (chunk size optimization, relevance scoring, content freshness, duplicate detection). Check: missing features (bulk import, content versioning, usage analytics, test query tool, chunk preview).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 20. Knowledge Base — UX Research

Analyze entry creation flow, list view, status indicators. Research: content management UX (upload progress, processing feedback, preview before publish, drag-and-drop upload). Check: file upload UX, processing state communication, entry editing, search within knowledge base.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 21. Automation Flow Editor — Product Research

Review automation system. Compare with Make.com/Zapier/HubSpot workflows. Research: automation builder patterns (visual flow builder, template library, test/debug mode, version history, error handling). Check: missing features (branching conditions, loop prevention, execution history detail, template marketplace, undo/redo).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 22. Automation Flow Editor — UX Research

Analyze flow editor layout, step configuration, trigger selection. Research: workflow builder UX (visual feedback, drag-to-reorder steps, inline configuration, validation indicators). Check: step reordering, visual flow diagram, save/discard confirmation, test run feedback, mobile editor experience.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 23. Automation Engine & Scheduler — Product Research

Review automation engine reliability. Compare with production automation systems. Research: job scheduling patterns (retry strategies, dead letter queues, concurrency control, idempotency). Check: error recovery, duplicate execution prevention, flow execution timeout, logging granularity, monitoring/alerting.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 24. Webhook Ingestion — Product Research

Review webhook system. Compare with HubSpot/Pipedrive webhook handling. Research: webhook best practices (payload validation, rate limiting, authentication, retry on failure, event deduplication). Check: missing features (webhook secret/HMAC verification, request logging, payload transformation, rate limiting, IP allowlisting).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 25. Webhook Management UI — UX Research

Analyze webhook management page. Research: developer-facing UX (copyable URLs, test webhook button, request log viewer, field mapping builder). Check: inline field mapping editor, webhook test tool, recent request history, error display, documentation/help text.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 26. Settings — Tenant & Team — Product Research

Review tenant settings and team management. Compare with Monday.com/HubSpot team settings. Research: multi-tenant admin features (role permissions matrix, audit log, SSO, team hierarchy). Check: missing features (permission matrix, invite link, pending invites, role editing, profile management).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 27. Settings — Tenant & Team — UX Research

Analyze settings page layout, form design, team list. Research: settings page UX (grouped sections, save behavior, destructive action confirmation, tab navigation). Check: unsaved changes warning, form reset, success feedback, dangerous zone for org deletion, responsive layout.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 28. Settings — Pipeline & Custom Fields — Product Research

Review pipeline and custom field management. Compare with Pipedrive/HubSpot pipeline settings. Research: CRM pipeline customization (multiple pipelines, stage probability, required fields per stage, conditional fields). Check: missing features (multiple pipelines, stage-specific required fields, field dependencies, field groups).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 29. Settings — Pipeline & Custom Fields — UX Research

Analyze pipeline editor and custom field creator. Research: configuration UX (drag-to-reorder, inline editing, preview, undo). Check: color picker UX, drag-to-reorder statuses, field type preview, option editor for SELECT fields, required field toggle feedback.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 30. Global Search — Product Research

Review search implementation. Compare with HubSpot/Monday.com global search. Research: CRM search features (faceted search, recent searches, search suggestions, saved searches, search across all entities). Check: missing features (search by custom field values, recent search history, search result ranking, entity type filters).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 31. Global Search — UX Research

Analyze search bar, results dropdown, interaction flow. Research: search UX patterns (keyboard shortcut Cmd+K, result highlighting, grouped results, no-results state, search-as-you-type). Check: debounce timing, keyboard navigation of results, result previews, mobile search experience, focus management.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 32. Navigation & Layout — Product Research

Review sidebar navigation and dashboard layout. Compare with Monday.com/HubSpot navigation patterns. Research: SaaS navigation (collapsible sidebar, breadcrumbs, notification badges, recent items, favorites). Check: missing features (breadcrumbs, notification badges, recent items, favorites/pinned, settings sub-navigation).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 33. Navigation & Layout — UX Research

Analyze sidebar design, mobile responsiveness, header layout. Research: navigation UX (active state clarity, icon + label, section grouping, keyboard navigation, RTL support). Check: sidebar collapse/expand animation, mobile drawer behavior, touch targets, navigation depth, settings page navigation (tabs vs sidebar).

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 34. Multi-tenancy & Data Isolation — Product Research

Review tenant scoping implementation. Research: multi-tenant SaaS patterns (data isolation testing, tenant switching, cross-tenant data leaks, performance isolation). Check: tenant middleware coverage, missing tenant scopes, tenant context in all queries, tenant data export.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 35. i18n & RTL Support — Product Research

Review i18n implementation and RTL support. Research: RTL CRM best practices (bidirectional text, mirrored layouts, date/number formatting, RTL-aware components). Check: missing translations, hardcoded strings, date/time localization, number formatting, RTL layout issues, language switcher UX.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 36. Error Handling & Loading States — UX Research

Review error handling across all pages. Research: error UX patterns (toast notifications, inline errors, retry buttons, empty states, skeleton loaders, optimistic updates). Check: inconsistent error display, missing loading states, missing empty states, network error handling, offline support.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 37. Performance & Optimization — Product Research

Review frontend and backend performance. Research: CRM performance benchmarks (page load time, tRPC response time, list rendering, bundle size). Check: unnecessary re-renders, missing query caching, N+1 queries in routers, bundle splitting, image optimization, lazy loading.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 38. Security & Access Control — Product Research

Review security implementation. Research: CRM security best practices (OWASP, input sanitization, rate limiting, CSRF protection, role-based access). Check: missing rate limiting, input validation gaps, XSS vectors in user content, role enforcement in all routes, API key exposure.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 39. Mobile Responsiveness — UX Research

Review all pages on mobile viewports. Research: mobile CRM UX (touch targets, swipe gestures, bottom navigation, mobile-first patterns). Check: every page on 375px width, touch target sizes, horizontal scroll issues, mobile kanban, mobile chat, mobile table.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements

### 40. Cross-cutting Concerns — Product Research

Review notifications, real-time updates, data export, API documentation. Research: CRM platform features (in-app notifications, email notifications, Zapier/API integrations, data export, audit trail). Check: missing notification system, missing SSE implementation, missing CSV export, missing API docs, missing webhook retry logic.

- [x] Code Review
- [x] Competitive Research
- [x] UX Best Practices
- [x] Write Improvements
