# CRM Feature Improvements

Prioritized improvement list per module, based on code review, competitive research, and UX best practices.

**Priority levels:** P0 = critical (blocks adoption), P1 = important (significantly improves experience), P2 = nice-to-have (polish)

---

## 1. Auth & Onboarding — Product

### Code Review Findings

- No password reset / "Forgot Password" flow exists
- No email verification enforcement (field exists but no flow)
- No auth guards on `/dashboard` routes — unauthenticated users can access all pages
- No redirect if already logged in (visiting `/login` while authenticated should redirect to `/dashboard`)
- Home page (`/`) doesn't check auth state — shows Sign In/Register links regardless
- No session expiry handling — if session expires mid-use, requests silently fail
- Onboarding page accessible even if user already has a tenant
- No progress indicator during onboarding (just a single form)

### Competitive Findings

- **HubSpot**: 3-phase onboarding (Discovery → Configuration → Adoption) over 90 days. Guided setup wizard with role-based customization. Progress tracking dashboard. [Source: RevvGrowth HubSpot Onboarding Guide](https://www.revvgrowth.com/hubspot-agency/hubspot-onboarding-guide)
- **Monday.com**: User persona segmentation during signup. Blurred dashboard preview behind signup form. Onboarding checklist with video tutorials. Empty states guide first action. [Source: Appcues CRM Onboarding](https://www.appcues.com/blog/crm-software-user-onboarding)
- **Pipedrive**: Minimal signup (email + password), then guided pipeline setup. Sample data pre-loaded to show value immediately.

### UX Best Practices

- "Forgot password?" link should be directly below the password field — 75% of users who start a reset drop off before finishing if it's hard to find. [Source: CXL Password UX](https://cxl.com/blog/password-ux/)
- Password strength indicator + real-time requirements checklist as user types. [Source: NN/G Registration Checklist](https://www.nngroup.com/articles/checklist-registration-login/)
- Progressive onboarding with checklist — progress bar starting at 20% leverages the Zeigarnik effect (desire to complete). [Source: ProductLed SaaS Onboarding](https://productled.com/blog/5-best-practices-for-better-saas-user-onboarding)
- Empty states should provide direction and next best action, not just "No data yet". [Source: Flowjam SaaS Onboarding Guide](https://www.flowjam.com/blog/saas-onboarding-best-practices-2025-guide-checklist)

### Improvements

| #  | Priority | Improvement                                           | Details                                                                                                                                                            |
| -- | -------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1  | P0       | Add password reset flow                               | "Forgot password?" link on login page → email reset link → new password form. Better Auth supports this natively.                                                  |
| 2  | P0       | Add auth guards to dashboard routes                   | Redirect unauthenticated users to `/login`. Check session in route loader or layout component.                                                                     |
| 3  | P0       | Redirect authenticated users away from login/register | If user is already logged in, redirect to `/dashboard` from `/login`, `/register`, and `/`.                                                                        |
| 4  | P1       | Add onboarding guard                                  | If user has no tenant, redirect from `/dashboard` to `/onboarding`. If user has a tenant, redirect from `/onboarding` to `/dashboard`.                             |
| 5  | P1       | Add email verification flow                           | Send verification email on registration. Show banner until verified. Better Auth supports this.                                                                    |
| 6  | P1       | Add password strength indicator                       | Real-time requirements checklist (min 8 chars, etc.) with visual feedback as user types.                                                                           |
| 7  | P1       | Add onboarding checklist / progress                   | After org creation, show a dashboard checklist: "Add your first customer", "Set up WhatsApp", "Create knowledge base entry", "Invite team member". Track progress. |
| 8  | P1       | Pre-populate with sample data option                  | During onboarding, offer "Start with sample data" button that seeds demo customers, statuses, etc.                                                                 |
| 9  | P1       | Handle session expiry gracefully                      | Detect 401 responses, show "Session expired" toast, redirect to login.                                                                                             |
| 10 | P2       | Add social login (Google OAuth)                       | Better Auth supports Google provider. Reduces signup friction significantly.                                                                                       |
| 11 | P2       | Add "Remember me" checkbox on login                   | Extend session duration when checked.                                                                                                                              |
| 12 | P2       | Show blurred dashboard preview behind auth forms      | Like Monday.com — gives users a preview of what they'll get after signing up.                                                                                      |
| 13 | P2       | Add autocomplete attributes to form fields            | `autocomplete="email"`, `autocomplete="new-password"`, etc. for browser autofill support.                                                                          |

---

## 2. Auth & Onboarding — UX

### Code Review Findings

- No password visibility toggle (eye icon) on password fields
- No inline validation — errors only shown after form submission
- No `aria-describedby` linking error messages to form fields
- No focus management — error doesn't move focus to the error message or first invalid field
- Labels exist but no `aria-required` or `aria-invalid` attributes
- No keyboard shortcut to submit (Enter works, but no visual hint)
- Mobile: forms are responsive but no special mobile optimizations (bottom-sheet, native keyboard types)
- No loading spinner — just text change on button ("Creating account..." / "Signing in...")

### Competitive Findings

- **Best SaaS login pages**: Vertical stack layout with social login buttons (Google, Microsoft) prioritized above email/password form. [Source: Authgear Login/Signup UX Guide](https://www.authgear.com/post/login-signup-ux-guide)
- **Password visibility toggle**: Standard pattern across all modern SaaS — eye icon in the password field. Especially critical on mobile. [Source: Eleken Login Page Examples](https://www.eleken.co/blog-posts/login-page-examples)
- **Inline validation**: Real-time field validation reduces form abandonment. Password requirements shown as a checklist that updates as user types. [Source: UXPin Login Page Design](https://www.uxpin.com/studio/blog/login-page-design/)

### UX Best Practices

- `aria-describedby` should link password fields to requirement text — screen readers announce "Must be at least 8 characters" after the field name. [Source: Web Accessibility Checker ARIA Guide](https://web-accessibility-checker.com/en/blog/aria-labels-best-practices)
- Focus management on error: move focus to first invalid field or error summary. [Source: NN/G Keyboard Accessibility](https://www.nngroup.com/articles/keyboard-accessibility/)
- Keyboard focus indicators must be clearly visible and distinguishable. [Source: Baymard EU Accessibility Act](https://baymard.com/blog/european-accessibility-act-2025)

### Improvements

| #  | Priority | Improvement                                       | Details                                                                                                     |
| -- | -------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1  | P1       | Add password visibility toggle                    | Eye icon button inside password input to toggle between hidden/visible text.                                |
| 2  | P1       | Add inline validation with real-time feedback     | Validate email format, password length, name length as user types. Show green checkmark or red X per field. |
| 3  | P1       | Add `aria-describedby` for error messages         | Link error div to form fields so screen readers announce errors in context.                                 |
| 4  | P1       | Add `aria-invalid` and `aria-required` attributes | Dynamic `aria-invalid="true"` when field has error. `aria-required="true"` on required fields.              |
| 5  | P1       | Focus management on form errors                   | On submission error, move focus to the error message or first invalid field.                                |
| 6  | P1       | Add loading spinner to submit button              | Replace text-only loading state with a spinner icon + text for clearer feedback.                            |
| 7  | P2       | Add password requirements checklist               | Below password field, show real-time checklist: "8+ characters ✓", "Contains number ✗", etc.                |
| 8  | P2       | Improve mobile form experience                    | Use `inputMode="email"` for email fields, proper keyboard type hints, larger touch targets (min 44px).      |
| 9  | P2       | Add visible focus ring styles                     | Ensure all form inputs have clear, high-contrast focus indicators for keyboard users.                       |
| 10 | P2       | Add skip-to-content link                          | For keyboard/screen reader users navigating auth pages.                                                     |

---

## 3. Dashboard — Product

### Code Review Findings

- Only 4 stat cards: total customers, new today, active conversations, total messages
- Missing critical CRM metrics: conversion rate, win rate, average deal time, pipeline value, response time, bot vs human ratio
- No date range filter — always shows "today" or "all time" with no toggle
- No comparison to previous period (e.g., "+12% vs last week")
- No time-series charts (messages over time, new customers over time)
- Funnel chart is a simple horizontal bar — no actual funnel shape
- Funnel query has N+1 pattern (separate count query per status)
- No loading skeletons — stats show "0" while loading (misleading)
- No real-time refresh / SSE integration
- No customizable widgets — fixed layout for all users

### Competitive Findings

- **HubSpot**: Customizable dashboards with drag-and-drop widgets. Key metrics: pipeline coverage, win rate, sales cycle length, average deal size, forecast accuracy. Time-series charts for trends. Comparison to previous periods. [Source: Pixcell HubSpot Sales Reporting](https://www.pixcell.io/blog/hubspot-sales-reporting-best-dashboards)
- **Pipedrive**: KPI cards with trend arrows. Pipeline health report with stalled deal detection. Line/pie/bar chart options. Win rate, deal velocity, aging analysis. AI-generated reports from prompts. [Source: Pipedrive Sales Dashboard](https://www.pipedrive.com/en/features/sales-dashboard)
- Both competitors show **comparison to prior period** on every metric card (↑12% vs last week).

### UX Best Practices

- Place 3-5 most critical KPIs at the top as metric cards with large numbers, trend arrows, and sparklines. [Source: UXPin Dashboard Design Principles](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- Information overload affects 46.7% of dashboard users — use progressive disclosure and contextual filtering. [Source: Pencil & Paper Dashboard UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)
- Encode most important data in linear charts — users perceive critical relationships preattentively. [Source: NN/G Dashboard Charts](https://www.nngroup.com/articles/dashboards-preattentive/)

### Improvements

| #  | Priority | Improvement                        | Details                                                                                                                           |
| -- | -------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1  | P0       | Add loading skeletons for stats    | Show skeleton cards while data loads instead of "0" values which are misleading.                                                  |
| 2  | P1       | Add conversion rate metric         | Calculate won / (won + lost) as a percentage. Show in stat card.                                                                  |
| 3  | P1       | Add trend comparison to stat cards | Show "↑12% vs last week" or sparkline next to each metric. Requires storing historical snapshots or calculating from createdAt.   |
| 4  | P1       | Add date range filter              | Dropdown: Today, This Week, This Month, This Quarter, Custom. Filter all dashboard data by selected range.                        |
| 5  | P1       | Add time-series chart              | Line chart showing new customers or messages per day/week over selected period. Use a lightweight chart library (e.g., recharts). |
| 6  | P1       | Add bot vs human response ratio    | Pie/donut chart showing BOT vs HUMAN message sender breakdown. Key metric for AI-powered CRM.                                     |
| 7  | P1       | Add average response time metric   | Calculate average time between customer message and first response (bot or human).                                                |
| 8  | P1       | Fix funnel N+1 query               | Use Prisma groupBy to count customers per status in a single query instead of N separate counts.                                  |
| 9  | P2       | Add pipeline value metric          | Sum of custom field "budget" across active (non-closed) customers. Requires knowledge of custom field keys.                       |
| 10 | P2       | Add clickable stat cards           | Click "Total Customers" → navigate to customers page. Click "Active Conversations" → navigate to conversations.                   |
| 11 | P2       | Add funnel visualization           | Replace horizontal bars with a proper funnel/triangle shape showing stage-to-stage conversion drop-off.                           |
| 12 | P2       | Add auto-refresh with SSE          | Dashboard stats refresh in real-time when new customers or messages arrive.                                                       |
| 13 | P2       | Add recent activity feed           | Show last 5-10 activities (new customer, status change, message) as a timeline on the dashboard.                                  |

---

## 4. Dashboard — UX

### Code Review Findings

- No skeleton loaders — stat cards show "0" during loading, indistinguishable from "actually zero"
- Numbers have no formatting (no comma separators for thousands, no "%" for rates)
- Funnel bars have no hover state or tooltip showing exact values
- No empty state — if org has zero data, dashboard looks like it's broken
- Stat card grid is responsive (sm:2, lg:4) but cards have no minimum height consistency
- No hover/click interaction on stat cards
- Chart colors rely solely on status colors — no accessibility check for color-blind users

### Competitive & UX Findings

- Skeleton loaders reduce perceived load time by 20-40% vs spinners. Best skeletons match content shape exactly. [Source: LogRocket Skeleton Loading](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/)
- Stat cards should be 200-280px wide with one visual each (sparkline OR trend arrow, not both). Use CSS Grid `auto-fill, minmax(200px, 1fr)`. [Source: Art of Styleframe Dashboard Patterns](https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/)
- Dashboard users are power users — prioritize information density over whitespace. [Source: 5of10 Dashboard Best Practices](https://5of10.com/articles/dashboard-design-best-practices/)
- Named CSS Grid areas for responsive layout shifts between viewport widths. 12-column grid, 24px gutters. [Source: Datawirefra.me Dashboard Layouts](https://www.datawirefra.me/blog/dashboard-layout-patterns)

### Improvements

| # | Priority | Improvement                               | Details                                                                                                                                           |
| - | -------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | P1       | Add skeleton loaders matching card shapes | Pulse animation skeletons for each stat card and funnel chart during data loading. Prevents "0" confusion.                                        |
| 2 | P1       | Format numbers                            | Use `Intl.NumberFormat` for thousand separators (1,234), percentages (45.2%), and currency ($50K).                                                |
| 3 | P1       | Add empty state for new orgs              | When all stats are zero, show a welcome message with action buttons: "Add your first customer", "Set up WhatsApp", etc. Instead of showing zeros. |
| 4 | P1       | Add hover tooltips on funnel bars         | Show exact count and percentage of total on hover for each status bar.                                                                            |
| 5 | P2       | Add color-blind-safe palette option       | Ensure funnel chart colors pass WCAG contrast. Add pattern fills as alternative to color-only encoding.                                           |
| 6 | P2       | Add stat card min-height consistency      | Ensure all cards in a row have equal height regardless of content, using CSS Grid `align-items: stretch`.                                         |
| 7 | P2       | Add dashboard greeting                    | "Good morning, {name}" with current date. Personalizes the experience.                                                                            |
| 8 | P2       | Animate stat numbers on load              | Count-up animation from 0 to final value (200ms). Adds polish and draws attention to key metrics.                                                 |

---

## 5. Customer Kanban — Product

### Code Review Findings

- Hardcoded `pageSize: 200` — will break with larger datasets, no virtualization or lazy loading
- No "Add Customer" button on the kanban view or within columns
- Cards only show name + phone — no email, no assigned user avatar, no tags, no custom fields
- No click-to-open — cards are not linked to customer detail page
- No quick actions on cards (right-click menu, hover actions)
- No column collapse/expand — all columns always visible
- No drag visual feedback — no placeholder shown in source column, no drop zone highlighting
- No optimistic update — full refetch after every status change (flickers)
- No search/filter while in kanban view
- No WIP (work-in-progress) limits on columns
- No "Add Column" (add status) from kanban view
- HTML5 drag-and-drop: no touch/mobile support, no keyboard accessibility

### Competitive Findings

- **Monday.com**: Column WIP limits settable per column. "+" button on column header to add items inline. Card shows customizable column data from the board. Subitems displayable on cards. [Source: Monday.com Kanban View Support](https://support.monday.com/hc/en-us/articles/360000661379-The-Kanban-View)
- **Pipedrive**: Cards show deal value, contact name, org, expected close date. Quick actions on hover (edit, delete, email). Drag shows ghost card with drop zone highlight. Rotting indicators for stale deals. [Source: Pipedrive Sales Dashboard](https://www.pipedrive.com/en/features/sales-dashboard)

### UX Best Practices

- Drag states: idle → hover → grab → move → drop. Each state needs visual feedback. Drop zones need contrasting border/background highlight. [Source: LogRocket Drag-and-Drop UX](https://blog.logrocket.com/ux-design/drag-and-drop-ui-examples/)
- Touch support: use drag handles instead of whole-card grab. Increase drop zone size on mobile. [Source: Eleken Drag-and-Drop UI](https://www.eleken.co/blog-posts/drag-and-drop-ui)
- Accessibility: provide keyboard alternative (Tab + Enter + Arrow keys) and "Move to" button/menu per card (WCAG 2.5.7). ARIA live announcements during drag. [Source: AppInstitute Drag-and-Drop Accessibility](https://appinstitute.com/drag-and-drop-design-accessibility-best-practices/)

### Improvements

| #  | Priority | Improvement                                  | Details                                                                                                                               |
| -- | -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | P0       | Make cards clickable to customer detail      | Click card → navigate to `/dashboard/customers/{id}`. Currently cards are only draggable with no navigation.                          |
| 2  | P0       | Add "Add Customer" button                    | Button in page header and/or "+" in each column header to create customer inline with pre-selected status.                            |
| 3  | P1       | Add drag visual feedback                     | Show semi-transparent placeholder in source position. Highlight drop zone column with border/background change. Show drag ghost card. |
| 4  | P1       | Add optimistic updates                       | Update UI immediately on drop, revert on error. Prevents full refetch flicker.                                                        |
| 5  | P1       | Show more info on cards                      | Add email, assigned user avatar/initials, tags as colored dots, and custom field values. Configurable card fields.                    |
| 6  | P1       | Add search/filter in kanban view             | Filter bar above kanban to search by name or filter by assigned user/tags.                                                            |
| 7  | P1       | Paginate or virtualize cards per column      | Replace `pageSize: 200` with per-column lazy loading. Show "Load more" at bottom of long columns.                                     |
| 8  | P1       | Add keyboard accessibility for drag-and-drop | Tab to card → Enter to pick up → Arrow keys to move between columns → Enter to drop. ARIA live region for announcements.              |
| 9  | P2       | Add column collapse/expand                   | Click column header to collapse to just header + count. Saves horizontal space with many statuses.                                    |
| 10 | P2       | Add WIP limits                               | Optional per-column card limit. Show warning color when column exceeds limit. Like Monday.com's "Set column limit".                   |
| 11 | P2       | Add quick actions menu on card hover         | Three-dot menu or right-click: Edit, Delete, Assign to, Change status, View details.                                                  |
| 12 | P2       | Add touch/mobile drag support                | Use a drag-and-drop library (dnd-kit) that supports touch events and pointer events.                                                  |
| 13 | P2       | Add "Move to" dropdown as drag alternative   | Per-card dropdown to move to another status without dragging. Accessible fallback.                                                    |

---

## 7-8. Customer Table — Product & UX

### Code Review Findings

- Only 5 columns: name, email, phone, status, createdAt — no assigned user, no tags, no custom fields
- No row selection checkboxes — can't select multiple rows for bulk actions
- No bulk actions bar (assign, change status, delete selected)
- No column visibility toggle — can't show/hide columns
- No column resize or reorder
- No sticky/frozen header — header scrolls away on long tables
- No frozen first column — name scrolls away on horizontal scroll
- No inline editing — only status has inline dropdown, other fields require navigating to detail page
- No row click to navigate — must manually go to `/dashboard/customers/{id}`
- No saved views / saved filters
- Sort only works on name and createdAt — not on email, phone, or status
- No search debounce — every keystroke triggers a new query
- Pagination shows "Showing X of Y" but no page number indicator
- No CSV export
- No "Add Customer" button in table view
- No empty state — empty table shows just column headers

### Competitive Findings

- **HubSpot**: Saved views as tabs. Column management (add, remove, reorder, freeze). Bulk edit property across selected records. Filter by any property. [Source: HubSpot Column Customization](https://knowledge.hubspot.com/records/customize-index-page-columns)
- **HubSpot**: Multiple view types per tab: table, board, calendar, report. Inline property editing. [Source: HubSpot View Types](https://knowledge.hubspot.com/records/manage-index-page-types-and-tabs)

### UX Best Practices

- Sticky header + frozen first column essential for tables wider than viewport. [Source: NN/G Data Tables](https://www.nngroup.com/articles/data-tables/)
- Pagination preferred over infinite scroll for goal-driven tasks (comparing, researching). Show page numbers, not just "Previous/Next". [Source: NinjaTables Pagination vs Scroll](https://ninjatables.com/infinite-scroll-vs-pagination/)
- Customizable column visibility with "Columns Showed" dropdown. [Source: LogRocket Data Table Best Practices](https://blog.logrocket.com/ux-design/data-table-design-best-practices/)
- Mobile tables need completely rethought layout — card-based view or stacked rows. [Source: NN/G Mobile Tables](https://www.nngroup.com/articles/mobile-tables/)

### Improvements

| #  | Priority | Improvement                       | Details                                                                                                |
| -- | -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1  | P0       | Add row click navigation          | Click row → navigate to customer detail page. Most fundamental table interaction.                      |
| 2  | P0       | Add "Add Customer" button         | Button in table header to open create customer form/modal.                                             |
| 3  | P1       | Add row selection checkboxes      | Checkbox column as first column. "Select all" in header.                                               |
| 4  | P1       | Add bulk actions bar              | When rows selected, show floating action bar: Assign, Change Status, Delete. Like HubSpot's bulk edit. |
| 5  | P1       | Add sticky table header           | `position: sticky; top: 0` on `<thead>`. Header stays visible while scrolling.                         |
| 6  | P1       | Add search debounce               | 300ms debounce on search input to prevent excessive API calls.                                         |
| 7  | P1       | Add assigned user column          | Show assigned team member name/avatar. Sortable.                                                       |
| 8  | P1       | Add column visibility toggle      | Dropdown menu to show/hide columns. Persist choice in localStorage.                                    |
| 9  | P1       | Add status filter dropdown        | Filter customers by status (separate from search). Multi-select filter.                                |
| 10 | P1       | Add empty state                   | When no customers match filter/search, show "No customers found" with clear filter button.             |
| 11 | P2       | Add inline editing                | Click cell to edit name, email, phone inline. Save on blur or Enter.                                   |
| 12 | P2       | Add CSV export                    | "Export" button downloads current filtered view as CSV.                                                |
| 13 | P2       | Add saved views                   | Save filter + sort + column config as a named view tab. Like HubSpot's saved views.                    |
| 14 | P2       | Add page number pagination        | Replace Previous/Next with "Page 1 of 5" with numbered page buttons.                                   |
| 15 | P2       | Add custom field columns          | Show custom field values as additional columns. Configurable per view.                                 |
| 16 | P2       | Add sortable status column        | Sort by status order (pipeline stage). Currently not sortable.                                         |
| 17 | P2       | Add frozen first column on mobile | Lock name column while scrolling horizontally on small screens.                                        |

---

## 9-10. Customer Detail — Product & UX

### Code Review Findings

- No inline editing — all fields are read-only. Must go elsewhere to edit customer.
- No "Edit" button or edit mode toggle
- No custom fields displayed — `customFields` JSON exists in the model but isn't rendered
- No assigned user display — `assignedToId` not shown or resolvable to a name
- No source display — customer source (WEBHOOK/MANUAL/etc.) not shown
- No conversation history link — can't see WhatsApp conversations from detail page
- Activity timeline and notes are in separate cards — not merged into a unified timeline
- Activity shows `actorId` but doesn't resolve to user name
- Notes show `authorId` but doesn't resolve to user name
- No note edit or delete from the detail page
- No delete customer action
- No status change from detail page — only visible as a badge
- "Back" button navigates with `as '/'` type cast — fragile
- "No activity yet" text is hardcoded in English, not i18n
- No breadcrumb navigation (Dashboard > Customers > Alice Johnson)

### Competitive Findings

- **HubSpot**: 3-column layout — left sidebar (properties), middle (activity timeline with tabs: Overview, Activities, Sales), right sidebar (associations: company, deals, tickets). 10 custom tabs. Inline property editing in left sidebar. [Source: HubSpot Record Layout](https://knowledge.hubspot.com/records/work-with-records)
- **HubSpot**: Left sidebar is customizable — drag properties, create property groups, show/hide fields per role. [Source: HubSpot Customize Sidebars](https://knowledge.hubspot.com/crm-setup/customize-record-sidebars)

### UX Best Practices

- Progressive disclosure: show summary by default, reveal details on hover/click/expand. Avoid visual clutter. [Source: Adam Fard CRM Design](https://adamfard.com/blog/crm-design)
- Contextual actions (reply, edit, annotate) as tertiary controls avoid primary clutter. [Source: Aufait UX CRM Best Practices](https://www.aufaitux.com/blog/crm-ux-design-best-practices/)
- Audit trail: clear undo function + history of changes. [Source: Design Studio CRM UX](https://www.designstudiouiux.com/blog/crm-ux-design-best-practices/)
- Navigation: define right starting point, show next best action, display path/breadcrumb. [Source: Excited CRM Design](https://excited.agency/blog/crm-design)

### Improvements

| #  | Priority | Improvement                                      | Details                                                                                                                           |
| -- | -------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1  | P0       | Add inline editing for customer fields           | Click field value to edit. Save on blur/Enter. Fields: name, email, phone, tags.                                                  |
| 2  | P0       | Add status change from detail page               | Dropdown or clickable badge to change status directly. Creates activity automatically.                                            |
| 3  | P0       | Display custom fields                            | Render all CustomFieldDefinition values from `customFields` JSON. Use proper input types per field type.                          |
| 4  | P1       | Add assigned user display + assignment           | Show assigned user name/avatar. Dropdown to change assignment.                                                                    |
| 5  | P1       | Merge activities and notes into unified timeline | Single chronological feed mixing activities, notes, and messages. Like HubSpot's middle column.                                   |
| 6  | P1       | Resolve actor/author names                       | Look up user names for `actorId` in activities and `authorId` in notes. Show "John Doe changed status" not just "Status changed". |
| 7  | P1       | Add conversation link                            | Show recent WhatsApp messages or link to conversation from detail page.                                                           |
| 8  | P1       | Add note edit and delete                         | Three-dot menu on each note: Edit, Delete. Inline editing for note body.                                                          |
| 9  | P1       | Add breadcrumb navigation                        | "Dashboard > Customers > Alice Johnson" instead of just a "Back" button.                                                          |
| 10 | P1       | Add delete customer action                       | "Delete" button in header or actions menu with confirmation dialog.                                                               |
| 11 | P1       | Fix hardcoded "No activity yet" string           | Move to i18n translations (en + he).                                                                                              |
| 12 | P2       | Add customer source badge                        | Show "Via Webhook" / "Manual" / "Facebook" source indicator.                                                                      |
| 13 | P2       | Add tabbed layout for detail sections            | Tabs: Overview, Activity, Conversations, Notes. Like HubSpot's middle column tabs.                                                |
| 14 | P2       | Add customer avatar/initials                     | Color circle with initials at the top of the detail page. Generated from name.                                                    |
| 15 | P2       | Add "Last contacted" timestamp                   | Show when the last message was sent/received for this customer.                                                                   |
| 16 | P2       | Add related entities sidebar                     | Right sidebar showing associated conversations, automation flows triggered, webhook source.                                       |

---

## 11-14. Activity Timeline & Notes — Product & UX

### Code Review Findings

- Timeline uses same-color dot (bg-primary) for all event types — no visual differentiation
- No icons per activity type (status change, note, assignment, creation all look identical)
- Timestamps are absolute (`toLocaleString()`) — not relative ("5 minutes ago")
- No activity type filtering — can't show only status changes or only notes
- No "load more" — hardcoded `pageSize: 50`, no pagination for activities
- Notes and activities rendered as separate sections — not unified chronologically
- No note editing or deletion from the UI
- No rich text in notes — plain text only
- No @mentions in notes
- No note pinning
- Activity `data` JSON rendered raw in `formatActivity()` — limited formatting

### Competitive & UX Findings

- Each event type should have a unique colored icon (green = success, blue = info, orange = user, red = problem). Consistent icon set (e.g., Lucide). [Source: Exmoorweb Activity Feed Design](https://www.exmoorweb.co.uk/blog/posts/activity-feed-timeline.php)
- Relative timestamps ("5 min ago", "Yesterday") are instantly understandable vs absolute timestamps. [Source: Aubergine Activity Feed Guide](https://www.aubergine.co/insights/a-guide-to-designing-chronological-activity-feeds)
- Category filtering via tabs or buttons for instant show/hide by event type. [Source: Dynamics 365 Timeline](https://stoneridgesoftware.com/configuring-the-timeline-in-the-unified-interface-crm/)
- Visual timeline with color-coded icons increased user engagement 187% and reduced event-finding time from 3.5 min to 22 sec. [Source: Exmoorweb](https://www.exmoorweb.co.uk/blog/posts/activity-feed-timeline.php)

### Improvements

| #  | Priority | Improvement                           | Details                                                                                                                                             |
| -- | -------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | P1       | Add type-specific icons and colors    | Different icon + color per activity type: 🔄 status change (blue), 📝 note (yellow), 👤 assignment (purple), ✨ created (green), 💬 message (teal). |
| 2  | P1       | Use relative timestamps               | "5 minutes ago", "Yesterday", "3 days ago". Show absolute on hover tooltip. Use a library like `date-fns/formatDistanceToNow`.                      |
| 3  | P1       | Add activity type filter              | Tab bar or filter chips: All, Status Changes, Notes, Messages, Assignments. Toggle visibility by type.                                              |
| 4  | P1       | Unify timeline                        | Merge activities + notes + messages into one chronological feed sorted by date. Each item styled by its type.                                       |
| 5  | P1       | Add note edit and delete              | Three-dot menu per note: Edit (inline), Delete (with confirmation).                                                                                 |
| 6  | P2       | Add "Load more" for long timelines    | Button at bottom to load next page of activities instead of hardcoded 50.                                                                           |
| 7  | P2       | Add rich text notes                   | Markdown support or basic formatting (bold, italic, lists) in note body.                                                                            |
| 8  | P2       | Add @mentions in notes                | Type `@` to mention team members. Mentioned users get notified.                                                                                     |
| 9  | P2       | Add note pinning                      | Pin important notes to the top of the timeline.                                                                                                     |
| 10 | P2       | Group activities by date              | "Today", "Yesterday", "April 15" date headers separating activity groups.                                                                           |
| 11 | P2       | Add "NEW" badge for recent activities | Highlight activities that occurred since the user's last visit.                                                                                     |

---

## 15-16. Conversations & Chat UI — Product & UX

### Code Review Findings

- No real-time updates — messages only refresh on manual refetch after sending. No SSE/polling.
- No typing indicator — neither "customer is typing" nor "agent is typing"
- No read receipts / message delivery status (sent, delivered, read)
- No unread message count / badge on conversation list items
- No last message preview in conversation list — only shows customer name + phone
- No message grouping — each message is a separate bubble even if sent consecutively
- No scroll-to-bottom on new messages
- No "new messages" indicator when scrolled up
- No media message support — text only, no images/files/voice
- No canned responses / quick replies
- No conversation search / filter
- No conversation assignment to specific team members
- No sound notification on new messages
- No emoji picker
- Conversation list not sorted by last activity (query sorts by updatedAt but UI doesn't show recency)
- Chat input is single-line `<input>` — should be multi-line `<textarea>` for longer messages
- No Shift+Enter for newline

### Competitive Findings

- **Intercom**: Typing indicators (visible to customer once agent starts replying). Read receipts ("Seen"/"Not yet seen"). Real-time messaging with instant delivery. [Source: Intercom Real-time Messaging](https://www.intercom.com/help/en/articles/258-real-time-messaging-explained)
- **Crisp**: Real-time view of what visitors are typing (agent can see before customer sends). Canned replies. Video/audio chat. @mentions between agents. [Source: Crisp vs Intercom Comparison](https://www.featurebase.app/blog/crisp-vs-intercom)

### UX Best Practices

- Chat input should be a resizable textarea, not single-line input. Shift+Enter for newline, Enter to send.
- Message grouping: consecutive messages from same sender within 1 minute should share one bubble group.
- Unread badges: show count on conversation list items and in sidebar nav.

### Improvements

| #  | Priority | Improvement                                   | Details                                                                                                           |
| -- | -------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1  | P0       | Add real-time message updates                 | Poll every 3-5 seconds or use SSE to push new messages. Currently messages only appear after manual send+refetch. |
| 2  | P0       | Add unread message count                      | Badge on each conversation in the list. Badge on "Conversations" nav item in sidebar.                             |
| 3  | P1       | Add last message preview in conversation list | Show truncated last message text + relative timestamp under customer name.                                        |
| 4  | P1       | Add scroll-to-bottom behavior                 | Auto-scroll to latest message on load and when new messages arrive. "New messages ↓" button when scrolled up.     |
| 5  | P1       | Replace input with textarea                   | Multi-line message input. Shift+Enter for newline, Enter to send. Auto-resize up to 4 lines.                      |
| 6  | P1       | Add message grouping                          | Group consecutive messages from same sender within 1 min. Show timestamp only on last message in group.           |
| 7  | P1       | Add canned responses                          | "/" command or dropdown to insert pre-written response templates. Configurable per tenant.                        |
| 8  | P1       | Add conversation search                       | Search bar in conversation list to find conversations by customer name or message content.                        |
| 9  | P2       | Add typing indicator                          | Show "Customer is typing..." when green-api reports typing status.                                                |
| 10 | P2       | Add message delivery status                   | Icons: ✓ sent, ✓✓ delivered, ✓✓ (blue) read. Based on green-api webhooks.                                         |
| 11 | P2       | Add emoji picker                              | Button next to send that opens emoji selector.                                                                    |
| 12 | P2       | Add media message support                     | Display images, files, and voice messages from WhatsApp. Upload and send media.                                   |
| 13 | P2       | Add sound notification                        | Browser notification sound on new inbound message. Configurable on/off.                                           |
| 14 | P2       | Add conversation assignment                   | Assign conversation to specific team member. Filter by "My conversations".                                        |

---

## 17-18. WhatsApp Bot & RAG — Product & UX

### Code Review Findings

- Handoff messages are hardcoded in English ("Connecting you with a team member...", "Let me connect you with a team member...") — not using tenant language
- No handoff notification to team — bot silently switches to human mode but no one is alerted
- No bot personality customization — system prompt is generic, not configurable per tenant
- Confidence threshold (0.7) is a good default but not surfaced in UI settings
- No conversation summary generated for agent taking over from bot
- RAG context limited to top 5 chunks — not configurable
- No fallback when OpenAI API is down — will throw unhandled error
- No rate limiting on WhatsApp webhook endpoint
- No message deduplication — same webhook could be processed twice
- Bot doesn't detect repeated questions (customer asking same thing differently)
- No bot analytics — can't see how often bot succeeds vs fails vs hands off

### Competitive Findings

- Multi-signal escalation: explicit request + confidence drop + sentiment analysis + VIP detection. Don't rely solely on confidence score. [Source: Dialzara AI-to-Human Handoff](https://dialzara.com/blog/ai-to-human-handoff-7-best-practices)
- Handoff should transfer: full transcript, AI summary (2-3 sentences), detected intent, customer sentiment. [Source: Alhena AI Handoff Best Practices](https://alhena.ai/blog/ai-human-escalation-chatbot-handoff-best-practices/)
- 86% of customers want the option to escalate to a human. 63% will abandon after one poor experience. [Source: SpurNow Chatbot Handoff Guide](https://www.spurnow.com/en/blogs/chatbot-to-human-handoff)
- Zendesk: confidence thresholds between 50-70% as sweet spot. If bot gives unhelpful response twice consecutively, escalate on third attempt. [Source: Zendesk Confidence Thresholds](https://support.zendesk.com/hc/en-us/articles/8357749625498-About-confidence-thresholds-for-advanced-AI-agents)

### Improvements

| #  | Priority | Improvement                                      | Details                                                                                                                           |
| -- | -------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1  | P0       | Translate handoff messages using tenant language | Use i18n or template per language instead of hardcoded English strings.                                                           |
| 2  | P0       | Add handoff notification to team                 | When bot hands off, push SSE notification + sound to assigned agent or all team members. Show which conversation needs attention. |
| 3  | P1       | Add conversation summary on handoff              | Generate a 2-3 sentence AI summary of the conversation so far. Show it to the agent taking over.                                  |
| 4  | P1       | Make system prompt customizable per tenant       | Add `botSystemPrompt` field to tenant settings. UI in Settings page to edit the bot's personality and instructions.               |
| 5  | P1       | Add bot analytics dashboard                      | Track: bot response rate, handoff rate, average confidence score, most common questions, response latency.                        |
| 6  | P1       | Add sentiment-based escalation                   | Detect frustration/anger in customer messages. Proactively offer human agent if negative sentiment detected.                      |
| 7  | P1       | Add OpenAI error handling                        | Graceful fallback when API is down — send "I'm having trouble right now, let me connect you with a team member" and hand off.     |
| 8  | P1       | Add webhook idempotency                          | Deduplicate incoming webhooks by `idMessage`. Prevent double-processing.                                                          |
| 9  | P2       | Add rate limiting on webhook endpoint            | Limit requests per IP/instance to prevent abuse.                                                                                  |
| 10 | P2       | Add configurable RAG parameters                  | Settings UI for: confidence threshold, number of chunks, max conversation history length.                                         |
| 11 | P2       | Add "consecutive failure" escalation             | If bot gives low-confidence responses 2+ times in a row, auto-escalate even if individual scores are above threshold.             |
| 12 | P2       | Add bot greeting message                         | Customizable first message when a new customer starts a conversation.                                                             |

---

## 19-20. Knowledge Base — Product & UX

### Code Review Findings

- PDF/DOCX parsing is a stub — `parseFile()` just does `buffer.toString('utf-8')` which won't work for binary formats
- No file upload endpoint — only text, QA pairs, and URLs are supported in the tRPC router
- URL parser is naive — regex-based HTML stripping misses many cases (JS-rendered content, iframes, etc.)
- No processing status indicator — embedding happens synchronously in the mutation, blocking the response
- No error handling if embedding fails — entire mutation fails silently
- No content preview or editing after creation
- No bulk import (CSV/JSON of QA pairs)
- No test query tool — can't test "what would the bot answer?" from the knowledge base
- No chunk preview — can't see how content was split
- No usage analytics — which entries are actually being retrieved by the bot
- Chunker uses rough 4:1 char-to-token ratio — inaccurate for non-English text
- No duplicate detection — same content can be added multiple times

### Competitive & UX Findings

- Semantic chunking achieves ~70% accuracy lift over fixed-size. Recursive chunking (paragraphs → sentences) is best starting point. Start at 400-512 tokens, 10-20% overlap. [Source: Firecrawl Chunking Strategies](https://www.firecrawl.dev/blog/best-chunking-strategies-rag)
- Add metadata to each chunk (source, author, date, tags) for filtering during retrieval. [Source: Redwerk RAG Best Practices](https://redwerk.com/blog/rag-best-practices/)
- Layered knowledge base with freshness policies — tag content with last-verified date. [Source: Orkes RAG Best Practices](https://orkes.io/blog/rag-best-practices/)

### Improvements

| #  | Priority | Improvement                           | Details                                                                                                                                            |
| -- | -------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | P0       | Implement real PDF/DOCX parsing       | Use `pdf-parse` for PDFs and `mammoth` for DOCX. Currently binary files will produce garbage text.                                                 |
| 2  | P0       | Add file upload endpoint              | Hono route accepting multipart form data → parse → chunk → embed. Currently only text/QA/URL supported.                                            |
| 3  | P1       | Make embedding async with status      | Return entry immediately with status "processing". Run embed pipeline in background. Show progress in UI (parsing → chunking → embedding → ready). |
| 4  | P1       | Add test query tool                   | "Ask a question" input on knowledge base page that runs RAG pipeline and shows: retrieved chunks, confidence scores, and generated answer.         |
| 5  | P1       | Add content editing                   | Edit entry title and content after creation. Re-embed on save.                                                                                     |
| 6  | P1       | Add error handling for embed failures | Catch OpenAI errors, set entry status to "failed", show retry button in UI.                                                                        |
| 7  | P2       | Add chunk preview                     | Expandable view showing how content was split into chunks. Helps debug RAG quality.                                                                |
| 8  | P2       | Add bulk Q&A import                   | CSV upload: question,answer per row. Batch create entries.                                                                                         |
| 9  | P2       | Add usage analytics                   | Track how often each entry's chunks are retrieved. Show "used 15 times this week" on entry cards.                                                  |
| 10 | P2       | Add duplicate detection               | Check if URL or content hash already exists before creating. Warn user.                                                                            |
| 11 | P2       | Improve URL parser                    | Use a proper HTML-to-text library (like `@mozilla/readability`) or headless browser for JS-rendered pages.                                         |

---

## 21-23. Automation — Product & UX

### Code Review Findings

- Flow editor is text-based (select dropdowns + text inputs) — no visual flow diagram
- No drag-to-reorder steps — can only add/remove
- No undo/redo in flow editor
- No flow execution history — can only see logs, not a visual execution trace
- No test/dry-run with visual feedback showing which steps passed/failed
- No template library — every flow starts from scratch
- Scheduler polls every 60 seconds — could miss time-sensitive flows
- No retry logic on failed steps — failure stops the flow permanently
- No execution timeout — a stuck step blocks the flow indefinitely
- No branching/conditional paths (by design for v1, but the UI should indicate this is coming)
- Engine doesn't fire automation triggers from customer.changeStatus or webhook handler — triggers are defined but not wired

### Competitive & UX Findings

- Make.com: visual canvas-based editor, best-in-class for complex flows. Supports branching, error routes, retry. [Source: Workflow Automation Reviews](https://workflowautomation.net/reviews/make)
- Zapier: auto-retry 3 times over 1 hour for transient failures. Linear trigger-action model for simplicity. [Source: Zapier Workflows](https://zapier.com/workflows)
- Error handling best practices: retry mechanisms, fallback paths, monitoring with alerts for >5% error rate. [Source: Inventive Webhook Best Practices](https://inventivehq.com/blog/webhook-best-practices-guide)

### Improvements

| #  | Priority | Improvement                                | Details                                                                                                                                                             |
| -- | -------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | P0       | Wire automation triggers into actual flows | customer.changeStatus, webhook handler, and WhatsApp webhook should call `findMatchingFlows()` and `executeFlow()`. Currently triggers are defined but never fired. |
| 2  | P1       | Add visual flow diagram                    | Read-only visual representation of the flow (vertical node graph). Show trigger at top, steps as connected nodes below.                                             |
| 3  | P1       | Add drag-to-reorder steps                  | Drag handle on each step to reorder. Currently can only add/remove.                                                                                                 |
| 4  | P1       | Add execution history per flow             | List of past executions with timestamp, customer, status (success/failed/partial), and per-step results.                                                            |
| 5  | P1       | Add retry logic on failed steps            | Configurable retry count (1-3) with exponential backoff. Don't permanently fail on first error.                                                                     |
| 6  | P1       | Add test/dry-run mode                      | "Test with customer" button — runs flow against a selected customer without actually sending messages. Shows step-by-step results.                                  |
| 7  | P2       | Add flow templates                         | Pre-built templates: "Welcome new customer", "Follow-up after 3 days", "Re-engage inactive". One-click create from template.                                        |
| 8  | P2       | Add execution timeout                      | Max execution time per step (30s default). Kill stuck steps and log timeout.                                                                                        |
| 9  | P2       | Reduce scheduler poll interval             | Poll every 10-15 seconds instead of 60 for more responsive delayed actions.                                                                                         |
| 10 | P2       | Add undo/redo in flow editor               | Ctrl+Z/Ctrl+Y for step changes. Track edit history in component state.                                                                                              |

---

## 24-25. Webhooks — Product & UX

### Code Review Findings

- No HMAC signature verification — anyone with the URL can POST data
- No request logging — can't see incoming webhook requests or errors
- No test webhook button — must use external tools (curl) to test
- Field mapping is a static JSON — no visual field mapper UI
- No request payload validation — accepts any JSON body
- No rate limiting — endpoint is open to abuse
- No webhook secret rotation
- No IP allowlisting option
- No webhook status monitoring (success/failure rate)

### Competitive & UX Findings

- Webhook security: TLS + HMAC signature + timestamp windows + secret rotation + IP allowlisting + RBAC + audit logging. [Source: HookMesh Webhook Security](https://gethookmesh.io/blog/webhook-security-best-practices/)
- Monitor: success/failure rates, processing duration, queue depth, retry counts. Alert on >5% error rate. [Source: Inventive Webhook Best Practices](https://inventivehq.com/blog/webhook-best-practices-guide)
- Validate incoming payloads against strict JSON schemas before processing. [Source: APIsec Webhook Security](https://www.apisec.ai/blog/securing-webhook-endpoints-best-practices)

### Improvements

| # | Priority | Improvement                     | Details                                                                                                                     |
| - | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1 | P0       | Add HMAC signature verification | Generate a webhook secret per endpoint. Verify `X-Signature` header on incoming requests. Reject unsigned/invalid requests. |
| 2 | P1       | Add request logging             | Store last 50 incoming requests per endpoint: timestamp, status code, payload preview, processing result. View in UI.       |
| 3 | P1       | Add test webhook button         | "Send test" button in UI that sends a sample payload to the endpoint and shows the result.                                  |
| 4 | P1       | Add visual field mapping editor | Drag-and-drop or dropdown-based UI to map external field names to Customer fields. Currently just a raw JSON object.        |
| 5 | P1       | Add payload validation          | Define expected schema per webhook. Reject requests missing required fields. Show validation errors in request log.         |
| 6 | P2       | Add webhook secret rotation     | Ability to regenerate the secret without changing the URL. Show both old and new secret during rotation window.             |
| 7 | P2       | Add rate limiting               | Configurable requests-per-minute limit per endpoint. Return 429 when exceeded.                                              |
| 8 | P2       | Add IP allowlisting             | Optional: restrict incoming requests to specific IP ranges.                                                                 |
| 9 | P2       | Add webhook health dashboard    | Success/failure rate chart, average processing time, volume over time.                                                      |

---

## 26-29. Settings — Product & UX

### Code Review Findings

**Tenant settings:**

- No save confirmation feedback (toast/banner on success)
- No unsaved changes warning when navigating away
- No form validation feedback (e.g., name too short)
- WhatsApp token shown as password field but no "show/hide" toggle
- No org deletion option (dangerous zone)
- Slug not editable after creation (which is correct, but no explanation why)

**Team management:**

- No pending invites list — invite creates membership immediately (user must already exist)
- No invite-by-link option — only by email
- No role change — can only set role at invite time
- No user profile/avatar display
- Remove member has no confirmation dialog
- No "current user" indicator — can't see which member is you

**Pipeline settings:**

- No drag-to-reorder statuses — order is set at creation time only
- No inline editing of status name/color — must delete and recreate
- Color picker is basic HTML `<input type="color">` — no preset palette
- No "set as default" toggle on existing statuses
- Delete has no confirmation dialog

**Custom fields:**

- No options editor for SELECT/MULTI_SELECT types — `options` array exists but no UI to populate it
- No field preview showing how it looks on the customer card
- No drag-to-reorder fields
- No inline editing of existing fields
- Delete has no confirmation dialog

### Competitive & UX Findings

- Destructive actions need red buttons, clear verb+noun labels ("Delete status"), and confirmation dialogs. Separate dangerous actions from benign ones spatially. [Source: NN/G Dangerous UX](https://www.nngroup.com/articles/proximity-consequential-options/)
- After destructive action, offer undo via toast notification. Show success/failure feedback immediately. [Source: Eleken Bulk Actions UX](https://www.eleken.co/blog-posts/bulk-actions-ux)
- Group related settings, minimize unnecessary elements. [Source: SapientPro SaaS UI/UX](https://sapient.pro/blog/designing-for-saas-best-practices)

### Improvements

| #  | Priority | Improvement                                      | Details                                                                                                                                                         |
| -- | -------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | P0       | Add save confirmation feedback                   | Toast notification on successful save for all settings forms. Currently no visual feedback.                                                                     |
| 2  | P0       | Add confirmation dialogs for destructive actions | Confirm before: removing team member, deleting status, deleting custom field. Use red button + clear label.                                                     |
| 3  | P1       | Add settings sub-navigation                      | Tab bar or sidebar within settings: General, Team, Pipeline, Custom Fields, WhatsApp. Currently no way to navigate between settings pages from within settings. |
| 4  | P1       | Add invite-by-link                               | Generate shareable invite link with expiry. Alternative to email-only invites.                                                                                  |
| 5  | P1       | Add role change for existing members             | Dropdown to change member role (ADMIN ↔ MEMBER). Currently role is fixed at invite time.                                                                        |
| 6  | P1       | Add drag-to-reorder for statuses                 | Drag handle to reorder pipeline stages. Currently order is set at creation only.                                                                                |
| 7  | P1       | Add inline editing for statuses                  | Click status name or color to edit in place. Currently must delete and recreate.                                                                                |
| 8  | P1       | Add SELECT/MULTI_SELECT options editor           | UI to add/remove/reorder options for select-type custom fields. Currently no way to set options.                                                                |
| 9  | P1       | Add unsaved changes warning                      | Browser `beforeunload` warning + in-app "You have unsaved changes" dialog when navigating away from dirty forms.                                                |
| 10 | P2       | Add "Danger Zone" section                        | Bottom of tenant settings: "Delete Organization" with red button + double confirmation (type org name to confirm).                                              |
| 11 | P2       | Add color preset palette                         | Quick-select common colors (blue, green, red, etc.) above the color picker for pipeline statuses.                                                               |
| 12 | P2       | Add "current user" badge on team list            | Highlight which member in the list is the currently logged-in user. Show "(you)" label.                                                                         |
| 13 | P2       | Add pending invites list                         | Show invites that haven't been accepted yet, with resend/revoke options.                                                                                        |
| 14 | P2       | Add custom field preview                         | Show a preview of how the field looks on a customer card when configuring field type and options.                                                               |

---

## 30-31. Global Search — Product & UX

### Code Review Findings

- Search only queries customers and notes — doesn't search conversations, knowledge base, automations
- No keyboard shortcut (Cmd/Ctrl+K) to focus search
- No search debounce — `enabled: query.length > 0` fires on every keystroke
- No keyboard navigation of results (arrow keys to select, Enter to navigate)
- No recent searches history
- Results dropdown doesn't show result type icons
- No result highlighting (matching text not bold/highlighted)
- No "Search across all" link to a full search results page
- Search bar is always visible but takes up header space — could use Cmd+K modal pattern instead

### Improvements

| # | Priority | Improvement                             | Details                                                                                                                            |
| - | -------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1 | P1       | Add Cmd/Ctrl+K keyboard shortcut        | Focus search on keyboard shortcut. Industry standard for SaaS search (Notion, Linear, GitHub).                                     |
| 2 | P1       | Add search debounce                     | 300ms debounce to prevent API call on every keystroke.                                                                             |
| 3 | P1       | Add keyboard navigation in results      | Arrow keys to highlight results, Enter to navigate, Escape to close.                                                               |
| 4 | P1       | Add result type icons                   | Customer icon, note icon in results to distinguish entity types.                                                                   |
| 5 | P2       | Search conversations and knowledge base | Expand search to include message body and knowledge entry titles.                                                                  |
| 6 | P2       | Add match highlighting                  | Bold the matching substring in result text.                                                                                        |
| 7 | P2       | Add recent searches                     | Show last 5 searches when search bar is focused with empty query.                                                                  |
| 8 | P2       | Convert to Cmd+K modal                  | Replace inline search bar with command palette modal (like Linear/Notion). More screen-efficient and supports additional commands. |

---

## 32-33. Navigation & Layout — Product & UX

### Code Review Findings

- No breadcrumbs — only a "Back" button on detail pages
- No notification badges on nav items (unread conversations count, pending invites)
- No settings sub-navigation — all 4 settings pages are separate routes but not linked from a settings sidebar
- Sidebar uses `<a>` tags with `navigate()` instead of `<Link>` — breaks client-side routing benefits (prefetching)
- No active state differentiation for nested routes (e.g., `/dashboard/settings/team` doesn't highlight "Settings" in nav)
- Actually, it does check `startsWith` for nested routes — but `navigate({ to: item.path as '/' })` is a type hack
- Mobile sidebar has no animation — just show/hide with CSS class toggle
- No "collapse sidebar" button for desktop — always 240px wide
- No user avatar/name in sidebar bottom — just "Sign Out" button
- No favorites/pinned items
- No recent items list

### Improvements

| # | Priority | Improvement                                         | Details                                                                                        |
| - | -------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1 | P1       | Add breadcrumbs                                     | "Dashboard > Customers > Alice Johnson" on all pages. Clickable path segments.                 |
| 2 | P1       | Add unread conversation badge                       | Red dot/count on "Conversations" nav item when there are unread messages.                      |
| 3 | P1       | Add settings sub-navigation                         | When on any settings page, show settings sidebar/tabs: General, Team, Pipeline, Custom Fields. |
| 4 | P1       | Use `<Link>` components instead of `<a>` + navigate | Proper TanStack Router links for prefetching and active state. Fix type casts.                 |
| 5 | P1       | Add user info in sidebar                            | Show current user name/avatar at sidebar bottom, above Sign Out.                               |
| 6 | P2       | Add sidebar collapse for desktop                    | Toggle button to collapse sidebar to icons-only (56px). Persist in localStorage.               |
| 7 | P2       | Add smooth mobile sidebar animation                 | Slide-in transition with backdrop fade. Currently instant show/hide.                           |
| 8 | P2       | Add recent items                                    | "Recent" section in sidebar showing last 5 visited customers/conversations.                    |
| 9 | P2       | Add notification system                             | In-app notification bell with dropdown: new messages, bot handoffs, team invites.              |

---

## 34. Multi-tenancy & Data Isolation

### Code Review Findings

- `tenantProcedure` middleware only picks `findFirst` membership — if user belongs to multiple tenants, always picks the first one. No tenant switching.
- No tenant selection UI for multi-tenant users
- WhatsApp webhook endpoint (`/api/whatsapp/webhook`) doesn't use `tenantProcedure` — finds tenant by green-api instance ID, which is correct but bypasses the standard middleware
- Webhook ingestion endpoint (`/api/webhook/:token`) finds tenant via webhook token — correct but also bypasses middleware
- No integration tests verifying tenant isolation (user A can't see user B's data)
- `customer.list` uses `where: { tenantId }` but constructs the where clause as `Record<string, unknown>` then casts to `never` — type safety gap
- Activity and Note models reference `actorId`/`authorId` without verifying the actor belongs to the same tenant
- No tenant context in cache keys (if caching is added later, risk of cross-tenant data leak)
- No data export per tenant (GDPR compliance)
- No audit log of who did what

### Competitive & UX Findings

- OWASP: include `tenant_id` in ALL resource queries, cache keys, and storage paths. Validate tenant ownership at data access layer. [Source: OWASP Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html)
- Test with multiple accounts across different tenants. Attempt to cross boundaries via every API endpoint. [Source: DZone Secure Multi-Tenancy](https://dzone.com/articles/secure-multi-tenancy-saas-developer-checklist)

### Improvements

| # | Priority | Improvement                                        | Details                                                                                                                                            |
| - | -------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | P0       | Add tenant switching for multi-tenant users        | If user belongs to multiple tenants, show tenant selector in sidebar. `tenantProcedure` should respect selected tenant, not just `findFirst`.      |
| 2 | P0       | Add tenant isolation integration tests             | Test suite verifying: User A cannot access User B's customers, conversations, knowledge, etc. across all tRPC procedures.                          |
| 3 | P1       | Use Prisma middleware for automatic tenant scoping | Instead of manually adding `tenantId` to every query, use a Prisma extension/middleware that auto-filters by tenant. Prevents accidental omission. |
| 4 | P1       | Add audit log                                      | Log all mutations (create, update, delete) with: who, what, when, tenantId. Stored in DB, viewable by admins.                                      |
| 5 | P2       | Add tenant data export                             | Admin action to export all tenant data as JSON/ZIP. GDPR Article 20 compliance.                                                                    |
| 6 | P2       | Add tenant-scoped cache keys                       | If Redis/in-memory caching is added, prefix all keys with `tenant:{id}:`.                                                                          |

---

## 35. i18n & RTL Support

### Code Review Findings

- Root layout sets `dir` attribute based on language — good foundation
- ~160 translation keys in en.ts, matching keys in he.ts — TypeScript enforces parity
- Several hardcoded English strings found in code: "Customer not found", "No activity yet" in customer detail
- Handoff messages in WhatsApp webhook are hardcoded English ("Connecting you with a team member...")
- No language switcher in the app UI — language is set per tenant during onboarding, can be changed in settings
- No per-user language preference — all users in a tenant see the same language
- Dates use `toLocaleDateString()` / `toLocaleString()` — respects browser locale, but not tenant language
- Numbers not formatted with `Intl.NumberFormat` — no thousand separators
- RTL: sidebar uses `start`/`end` properties (good) but `translate-x-full` / `-translate-x-full` may not flip correctly in RTL without `rtl:` prefix
- No Arabic language support (common CRM market)
- Custom field names and status names are user-defined, stored in one language only

### Improvements

| # | Priority | Improvement                           | Details                                                                                                                                       |
| - | -------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | P0       | Fix hardcoded English strings         | Move "Customer not found", "No activity yet", and all WhatsApp handoff messages to i18n. Run `lint:i18n` check.                               |
| 2 | P1       | Add per-user language preference      | Allow each user to set their own language, independent of tenant language. Useful for multilingual teams.                                     |
| 3 | P1       | Format dates using tenant/user locale | Use `Intl.DateTimeFormat` with explicit locale instead of browser default. Consistent dates across the team.                                  |
| 4 | P1       | Format numbers with locale            | `Intl.NumberFormat` for thousand separators, currency, percentages.                                                                           |
| 5 | P1       | Test RTL layout thoroughly            | Verify sidebar, kanban horizontal scroll, chat bubbles (outbound on left in RTL), table alignment, form layouts all work correctly in Hebrew. |
| 6 | P2       | Add Arabic language                   | Third major CRM market language. Add `ar.ts` locale file.                                                                                     |
| 7 | P2       | Add language switcher in header       | Quick language toggle for users without going to settings.                                                                                    |

---

## 36. Error Handling & Loading States

### Code Review Findings

- Only 3 of ~15 route files have any error/loading handling
- No global error boundary — React errors crash the entire app with white screen
- No toast notification system — errors shown inline (inconsistent) or silently swallowed
- tRPC errors in mutations are caught but shown as raw error messages (not user-friendly)
- No retry buttons on failed queries
- Loading states are inconsistent: some use skeletons, some show "0", some show nothing
- Empty states are inconsistent: some show "No customers", some show empty table, some show nothing
- No offline detection or network error handling
- No optimistic updates anywhere — all mutations do full refetch

### Competitive & UX Findings

- State priority: check errors first → loading with no data → data or empty state. [Source: LogRocket Loading/Error/Empty States](https://blog.logrocket.com/ui-design-best-practices-loading-error-empty-state-react/)
- Use ErrorBoundary + Suspense for consistent data-fetching states across the app. [Source: FreeCodeCamp Modern React Data Fetching](https://www.freecodecamp.org/news/the-modern-react-data-fetching-handbook-suspense-use-and-errorboundary-explained/)
- Toast notifications for recoverable errors. Error boundaries for unrecoverable crashes. [Source: LogRocket React Toastify Guide](https://blog.logrocket.com/react-toastify-guide/)

### Improvements

| # | Priority | Improvement                                 | Details                                                                                                                                              |
| - | -------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | P0       | Add global React ErrorBoundary              | Catch unhandled errors, show "Something went wrong" with retry button instead of white screen.                                                       |
| 2 | P0       | Add toast notification system               | Use a library (sonner, react-hot-toast). Show success toasts on mutations, error toasts on failures. Replace inline error divs for transient errors. |
| 3 | P1       | Standardize loading states                  | Create `<PageSkeleton>` and `<CardSkeleton>` components. Use consistently on all data-fetching pages.                                                |
| 4 | P1       | Standardize empty states                    | Create `<EmptyState>` component with icon, message, and action button. Use on all list/table/kanban pages.                                           |
| 5 | P1       | Add user-friendly error messages            | Map tRPC error codes to translated messages. Don't show raw "UNAUTHORIZED" or stack traces.                                                          |
| 6 | P1       | Add retry buttons on query failures         | When a query fails, show "Failed to load. [Retry]" instead of empty content.                                                                         |
| 7 | P2       | Add optimistic updates for common mutations | Status change, note creation, message sending — update UI immediately, revert on error.                                                              |
| 8 | P2       | Add network status detection                | Show banner "You're offline" when connection is lost. Queue mutations for retry.                                                                     |

---

## 37. Performance & Optimization

### Code Review Findings

- Kanban loads all 200 customers in one query — no virtualization or pagination
- Dashboard funnel has N+1 query (separate count per status)
- No query caching strategy — `staleTime: 60000` globally but no invalidation on mutations
- Bundle includes all routes — code splitting exists via TanStack Router but not verified
- No image optimization (customer avatars, if added)
- tRPC queries refetch entire lists after single-item mutations (e.g., status change refetches all customers)
- No `React.memo` or `useMemo` for expensive renders (kanban cards, table rows)
- Server builds all routes into a single 2.46MB bundle — could be split

### Improvements

| # | Priority | Improvement                            | Details                                                                                                                            |
| - | -------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1 | P1       | Fix N+1 query in dashboard funnel      | Use Prisma `groupBy` to count customers per status in a single query.                                                              |
| 2 | P1       | Add query invalidation after mutations | After `customer.changeStatus`, invalidate `customer.list` and `dashboard.getStats` queries specifically instead of refetching all. |
| 3 | P1       | Virtualize kanban columns              | For columns with 50+ cards, use virtual scrolling (react-virtual) instead of rendering all DOM nodes.                              |
| 4 | P2       | Add per-column pagination in kanban    | Load first 20 cards per column, "Load more" button for rest. Replace `pageSize: 200`.                                              |
| 5 | P2       | Analyze and optimize bundle size       | Run `vite-bundle-visualizer`. Ensure heavy deps (OpenAI, Qdrant) aren't in client bundle.                                          |
| 6 | P2       | Add React.memo to card/row components  | Prevent unnecessary re-renders of kanban cards and table rows on parent state changes.                                             |

---

## 38. Security & Access Control

### Code Review Findings

- No rate limiting on any endpoint (auth, tRPC, webhooks)
- No CSRF protection — Better Auth may handle this for auth routes, but tRPC mutations have no CSRF tokens
- No input sanitization for HTML/XSS — note body, customer name, etc. rendered with `{text}` (React auto-escapes JSX, so this is safe for text, but not for `dangerouslySetInnerHTML` if added later)
- Role enforcement is inconsistent — `tenant.invite` checks `memberRole === 'MEMBER'` but other admin-only actions don't check roles
- API keys (GREEN_API_TOKEN, OPENAI_API_KEY) stored in `.env` which is gitignored, but also in DB (greenApiToken) — DB value is plain text, not encrypted
- No password policy beyond min 8 chars
- No account lockout after failed login attempts
- No session timeout configuration
- Webhook endpoint accepts any JSON without size limit — potential DoS vector

### Improvements

| # | Priority | Improvement                                     | Details                                                                                                                        |
| - | -------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1 | P0       | Add rate limiting to auth endpoints             | Limit login attempts to 5/min per IP. Prevent brute force. Use a middleware like `hono-rate-limiter`.                          |
| 2 | P0       | Add consistent role enforcement                 | Create `adminProcedure` that extends `tenantProcedure` and checks `memberRole !== 'MEMBER'`. Use for all admin-only mutations. |
| 3 | P1       | Add rate limiting to tRPC and webhook endpoints | General rate limit: 100 req/min per user for tRPC, 60 req/min per token for webhooks.                                          |
| 4 | P1       | Encrypt sensitive DB fields                     | Encrypt `greenApiToken` at rest. Decrypt only when needed for API calls.                                                       |
| 5 | P1       | Add request body size limit                     | Limit JSON body to 1MB on webhook endpoints. Prevent large payload DoS.                                                        |
| 6 | P2       | Add account lockout                             | Lock account after 10 failed login attempts in 15 minutes. Unlock via email.                                                   |
| 7 | P2       | Add session timeout                             | Configurable session expiry (default 24h). Force re-login on expiry.                                                           |

---

## 39. Mobile Responsiveness

### Code Review Findings

- Dashboard: stat cards grid is responsive (2-col on sm, 4-col on lg) — good
- Kanban: fixed 72-width columns with horizontal scroll — works on mobile but awkward UX, no swipe gestures
- Table: horizontal scroll works but no frozen columns — header and name scroll away
- Customer detail: 3-col grid collapses to 1-col on mobile — good
- Chat: fixed height `calc(100vh-8rem)` — works but conversation list (w-72) takes too much space on mobile, should be full-width with tap-to-open pattern
- Sidebar: collapsible on mobile with overlay — functional but no slide animation
- Settings: max-w-lg forms work well on mobile
- Knowledge base: card grid is responsive — good
- Automation flow editor: max-w-2xl works on mobile but step cards could be wider
- No touch-specific interactions (swipe to delete, pull to refresh)

### Improvements

| # | Priority | Improvement                             | Details                                                                                                                                                             |
| - | -------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | P1       | Fix mobile chat layout                  | On mobile (<768px), conversation list should be full-width. Tapping a conversation opens chat as a separate view (not side-by-side). Back button to return to list. |
| 2 | P1       | Add mobile kanban swipe                 | Swipe horizontally between columns on touch devices. Show one column at a time on small screens with swipe navigation.                                              |
| 3 | P1       | Add frozen first column on mobile table | Lock customer name column while scrolling horizontally.                                                                                                             |
| 4 | P2       | Add pull-to-refresh                     | On mobile, pull down on list pages to refresh data. Native-feeling gesture.                                                                                         |
| 5 | P2       | Increase touch targets                  | Ensure all buttons and interactive elements are at least 44x44px on mobile (WCAG 2.5.8).                                                                            |
| 6 | P2       | Add bottom navigation on mobile         | Replace sidebar with bottom tab bar on small screens (Dashboard, Customers, Chat, Settings).                                                                        |

---

## 40. Cross-cutting Concerns

### Code Review Findings

- No in-app notification system — no bell icon, no notification center
- No email notifications (new message, bot handoff, team invite)
- SSE endpoint designed but not implemented — no real-time updates anywhere
- No CSV/data export functionality
- No API documentation (no OpenAPI/Swagger for webhook endpoints)
- No changelog or release notes mechanism
- No onboarding checklist after org creation
- No keyboard shortcuts anywhere
- No dark mode toggle (Tailwind dark mode is possible but not wired up)

### Improvements

| # | Priority | Improvement                         | Details                                                                                                                                                         |
| - | -------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | P1       | Implement SSE for real-time updates | Connect SSE endpoint for: new messages in chat, dashboard stat updates, bot handoff alerts. Foundation for real-time features.                                  |
| 2 | P1       | Add in-app notifications            | Bell icon in header with dropdown: new conversations, bot handoffs, team invites. Persist read/unread state.                                                    |
| 3 | P1       | Add onboarding checklist            | After org creation, show checklist on dashboard: "Add first customer ✓", "Set up WhatsApp", "Add knowledge base entry", "Invite team member". Track completion. |
| 4 | P1       | Add CSV export                      | Export button on customers table and conversations list. Download filtered data as CSV.                                                                         |
| 5 | P2       | Add email notifications             | Send emails for: bot handoff (to assigned agent), new team invite, daily summary. Configurable per user in settings.                                            |
| 6 | P2       | Add keyboard shortcuts              | `n` = new customer, `s` = search (Cmd+K), `?` = show shortcuts help.                                                                                            |
| 7 | P2       | Add dark mode                       | Toggle in header or settings. Tailwind `dark:` classes already available.                                                                                       |
| 8 | P2       | Add API documentation               | Auto-generate OpenAPI docs for webhook endpoints. Show in a `/docs` page.                                                                                       |
