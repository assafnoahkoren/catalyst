# Plan: CRM Improvements Implementation

**Source:** docs/plans/2026-04-18-crm-improvements.md
**Created:** 2026-04-18
**Status:** pending

## Verification-First Framework

Every task follows this loop. **Verification is mandatory — no skipping.**

```
1. Dev          — Implement the change
2. Verify       — Check it works using ALL of:
                   a) Playwright MCP: navigate, interact, take screenshot
                   b) Server logs: check /tmp/catalyst-server.log for errors
                   c) curl: test API endpoints directly
                   d) Browser console: check for JS errors
3. Fix          — If verification fails, fix and re-verify (loop until green)
4. Commit       — git add + commit only after verification passes
5. CI Check     — git push, gh run watch, verify CI green
```

**Verification checklist per task:**

- [ ] Playwright: page loads without errors
- [ ] Playwright: feature interaction works (click, fill, submit)
- [ ] Playwright: screenshot shows correct UI
- [ ] Server logs: no errors/warnings related to the change
- [ ] Console: no JS errors in browser
- [ ] Typecheck: `bun run typecheck` passes
- [ ] Lint: `bun run lint` passes
- [ ] i18n: `bun run lint:i18n` passes

---

## Phase 1: P0 Critical — Blocks Adoption (26 tasks)

### 1. Auth: Add password reset flow

- [ ] Dev: Enable Better Auth `forgetPassword` plugin in server.ts
- [ ] Dev: Add "Forgot password?" link below password field on login page
- [ ] Dev: Create `/reset-password` route with token-based password reset form
- [ ] Dev: Add i18n keys for forgot password flow (en + he)
- [ ] Verify: Playwright — navigate to /login, click "Forgot password?", verify page loads
- [ ] Verify: curl — POST to /api/auth/forgot-password with test email, check 200 response
- [ ] Verify: Server logs — no errors during password reset flow
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 2. Auth: Add auth guards to dashboard routes

- [ ] Dev: Add session check in /dashboard layout route loader
- [ ] Dev: Redirect unauthenticated users to /login
- [ ] Dev: Store intended destination, redirect back after login
- [ ] Verify: Playwright — navigate to /dashboard without auth, verify redirect to /login
- [ ] Verify: Playwright — navigate to /dashboard/customers without auth, verify redirect
- [ ] Verify: Playwright — login then verify redirect back to intended page
- [ ] Verify: Server logs — no auth errors, clean 401 responses
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 3. Auth: Redirect authenticated users away from login/register

- [ ] Dev: Check session in /login and /register route loaders
- [ ] Dev: If session exists, redirect to /dashboard
- [ ] Dev: Same for / (home page) — redirect to /dashboard if authenticated
- [ ] Verify: Playwright — login, then navigate to /login, verify redirect to /dashboard
- [ ] Verify: Playwright — navigate to /register while logged in, verify redirect
- [ ] Verify: Playwright — navigate to / while logged in, verify redirect
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 4. Error: Add global React ErrorBoundary

- [ ] Dev: Install `react-error-boundary` package
- [ ] Dev: Wrap app root with ErrorBoundary showing "Something went wrong" + retry button
- [ ] Dev: Add i18n keys: `somethingWentWrong`, `tryAgain`
- [ ] Dev: Style error fallback with centered layout matching app design
- [ ] Verify: Playwright — intentionally trigger an error (e.g., bad route), verify error boundary shows
- [ ] Verify: Playwright — click retry button, verify it recovers
- [ ] Verify: Console — verify error is caught, not an unhandled white screen
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 5. Error: Add toast notification system

- [ ] Dev: Install `sonner` (toast library)
- [ ] Dev: Add `<Toaster />` to root layout
- [ ] Dev: Replace all inline error divs in mutations with toast.error()
- [ ] Dev: Add toast.success() after successful mutations (settings save, customer create, etc.)
- [ ] Verify: Playwright — create a customer, verify success toast appears
- [ ] Verify: Playwright — trigger an error (e.g., duplicate slug), verify error toast appears
- [ ] Verify: Playwright — screenshot showing toast notification
- [ ] Verify: Check that old inline error divs are removed
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 6. Dashboard: Add loading skeletons for stats

- [ ] Dev: Create `<StatCardSkeleton>` component with pulse animation
- [ ] Dev: Create `<FunnelSkeleton>` component
- [ ] Dev: Show skeletons while `statsQuery.isLoading` instead of "0" values
- [ ] Verify: Playwright — navigate to /dashboard, take screenshot during loading (should see skeletons)
- [ ] Verify: Playwright — wait for data, verify skeletons replaced with real values
- [ ] Verify: Throttle network in Playwright to see skeletons clearly
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 7. Kanban: Make cards clickable to customer detail

- [ ] Dev: Wrap card content in a clickable area (separate from drag handle)
- [ ] Dev: onClick navigates to `/dashboard/customers/${customer.id}`
- [ ] Dev: Add cursor-pointer styling distinct from drag cursor
- [ ] Verify: Playwright — seed a customer, navigate to /dashboard/customers, click a card
- [ ] Verify: Playwright — verify URL changed to /dashboard/customers/{id}
- [ ] Verify: Playwright — verify customer detail page shows correct customer data
- [ ] Verify: Playwright — verify drag still works (drag a card, check status change)
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 8. Kanban: Add "Add Customer" button

- [ ] Dev: Add "Add Customer" button in page header
- [ ] Dev: Create add customer modal/form with name, email, phone, status selector
- [ ] Dev: Call customer.create mutation, refresh kanban on success
- [ ] Dev: Add i18n keys for the form
- [ ] Verify: Playwright — click "Add Customer" button, verify modal opens
- [ ] Verify: Playwright — fill form, submit, verify new card appears in kanban
- [ ] Verify: Playwright — verify customer appears in correct status column
- [ ] Verify: Server logs — verify customer.create mutation succeeded
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 9. Table: Add row click navigation

- [ ] Dev: Add onClick to each `<tr>` navigating to customer detail
- [ ] Dev: Add cursor-pointer to rows
- [ ] Dev: Ensure status dropdown click doesn't trigger row navigation (stopPropagation)
- [ ] Verify: Playwright — switch to table view, click a customer row
- [ ] Verify: Playwright — verify navigated to /dashboard/customers/{id}
- [ ] Verify: Playwright — verify status dropdown still works without navigating
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 10. Table: Add "Add Customer" button

- [ ] Dev: Reuse the same add customer modal from kanban task #8
- [ ] Dev: Add button in table view header
- [ ] Verify: Playwright — switch to table view, click "Add Customer"
- [ ] Verify: Playwright — fill form, submit, verify customer appears in table
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 11. Customer Detail: Add inline editing

- [ ] Dev: Make name, email, phone fields editable on click
- [ ] Dev: Show input on click, save on blur/Enter, cancel on Escape
- [ ] Dev: Call customer.update mutation on save
- [ ] Dev: Show loading indicator during save
- [ ] Verify: Playwright — navigate to customer detail, click name field
- [ ] Verify: Playwright — type new name, press Enter, verify saved
- [ ] Verify: Playwright — refresh page, verify new name persists
- [ ] Verify: Server logs — verify customer.update mutation succeeded
- [ ] Verify: Playwright — press Escape, verify edit cancelled (original value restored)
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 12. Customer Detail: Add status change

- [ ] Dev: Replace status badge with clickable dropdown
- [ ] Dev: Show all statuses from customerStatus.list
- [ ] Dev: Call customer.changeStatus on selection
- [ ] Dev: Verify activity is created automatically
- [ ] Verify: Playwright — navigate to customer detail, click status badge
- [ ] Verify: Playwright — select new status, verify badge changes
- [ ] Verify: Playwright — verify activity timeline shows "Status changed: X → Y"
- [ ] Verify: curl — GET customer by ID, verify statusId changed
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 13. Customer Detail: Display custom fields

- [ ] Dev: Fetch CustomFieldDefinitions for tenant
- [ ] Dev: Render each custom field value from customer.customFields JSON
- [ ] Dev: Use appropriate input type per field type (text, number, date, select, etc.)
- [ ] Dev: Make custom fields editable inline
- [ ] Verify: Playwright — seed customer with custom fields + definitions
- [ ] Verify: Playwright — navigate to customer detail, verify custom fields displayed
- [ ] Verify: Playwright — edit a custom field, save, verify persisted
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 14. Chat: Add real-time message updates

- [ ] Dev: Add polling interval (5s) to messages query when a conversation is selected
- [ ] Dev: Use `refetchInterval: 5000` on the messages query
- [ ] Dev: Also refetch conversation list every 10s for updated timestamps
- [ ] Verify: Playwright — open conversations page, select a conversation
- [ ] Verify: curl — POST a new message via tRPC to the same conversation
- [ ] Verify: Playwright — wait 5-6 seconds, verify new message appears without manual action
- [ ] Verify: Server logs — verify polling requests are working (no errors)
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 15. Chat: Add unread message count

- [ ] Dev: Add `lastReadAt` field to Conversation model (or track per-user)
- [ ] Dev: Calculate unread count in conversation.list query
- [ ] Dev: Show badge with count on each conversation in the sidebar list
- [ ] Dev: Show total unread badge on "Conversations" nav item in sidebar
- [ ] Dev: Update lastReadAt when user opens a conversation
- [ ] Verify: Playwright — seed messages, navigate to conversations, verify badges show counts
- [ ] Verify: Playwright — click a conversation, verify its badge disappears
- [ ] Verify: Playwright — verify sidebar nav badge shows remaining unread total
- [ ] Verify: Server logs — no errors in unread calculation
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 16. Bot: Translate handoff messages using tenant language

- [ ] Dev: Create handoff message templates per language in i18n
- [ ] Dev: Replace hardcoded English "Connecting you..." with `t()` lookup based on tenant.language
- [ ] Dev: Add keys: `botHandoffConnecting`, `botHandoffLowConfidence` (en + he)
- [ ] Verify: curl — set tenant language to "he", trigger handoff via WhatsApp webhook
- [ ] Verify: Server logs — verify Hebrew handoff message was sent
- [ ] Verify: curl — check message in DB has Hebrew text
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 17. Bot: Add handoff notification to team

- [ ] Dev: When bot sets isBot=false, emit event (SSE or polling flag)
- [ ] Dev: Add a "needs attention" indicator on conversation list (orange/red highlight)
- [ ] Dev: Add browser notification permission request
- [ ] Dev: Send browser notification on handoff
- [ ] Verify: Playwright — trigger a handoff scenario (low confidence or keyword)
- [ ] Verify: Playwright — verify conversation shows "needs attention" indicator
- [ ] Verify: Server logs — verify handoff event was created
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 18. Knowledge: Implement real PDF/DOCX parsing

- [ ] Dev: Install `pdf-parse` and `mammoth` packages
- [ ] Dev: Update `parseFile()` to use proper parsers based on mimeType
- [ ] Dev: Handle parsing errors gracefully
- [ ] Verify: Create a test PDF and DOCX file
- [ ] Verify: curl — upload PDF via knowledge endpoint, verify text extracted correctly
- [ ] Verify: curl — upload DOCX, verify text extracted
- [ ] Verify: Server logs — no parsing errors
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 19. Knowledge: Add file upload endpoint

- [ ] Dev: Create Hono route accepting multipart/form-data
- [ ] Dev: Parse uploaded file, chunk, embed, store
- [ ] Dev: Add upload form to knowledge/new page (drag-and-drop dropzone)
- [ ] Dev: Show upload progress (parsing → chunking → embedding → done)
- [ ] Verify: Playwright — navigate to /dashboard/knowledge/new
- [ ] Verify: Playwright — upload a .txt file via the form
- [ ] Verify: Playwright — verify entry appears in knowledge list with chunk count > 0
- [ ] Verify: Server logs — verify embedding pipeline completed without errors
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 20. Automation: Wire triggers into actual flows

- [ ] Dev: In customer.changeStatus router, call `findMatchingFlows()` + `executeFlow()`
- [ ] Dev: In webhook handler, call triggers after customer creation
- [ ] Dev: In WhatsApp webhook, call triggers on message received
- [ ] Dev: Start automation scheduler in server index.ts
- [ ] Verify: curl — create an automation flow with trigger STATUS_CHANGE
- [ ] Verify: curl — change a customer's status
- [ ] Verify: Server logs — verify automation engine fired and executed steps
- [ ] Verify: curl — check AutomationLog for execution record
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 21. Settings: Add save confirmation feedback (toast)

- [ ] Dev: Add toast.success() after tenant.update mutation succeeds
- [ ] Dev: Add toast.success() after team invite succeeds
- [ ] Dev: Add toast.success() after status create/delete succeeds
- [ ] Dev: Add toast.success() after custom field create/delete succeeds
- [ ] Verify: Playwright — go to settings, change org name, save, verify toast appears
- [ ] Verify: Playwright — go to pipeline settings, add status, verify toast
- [ ] Verify: Playwright — screenshot showing success toast
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 22. Settings: Add confirmation dialogs for destructive actions

- [ ] Dev: Create `<ConfirmDialog>` component with title, message, confirm/cancel buttons
- [ ] Dev: Use red confirm button with verb+noun label ("Delete status")
- [ ] Dev: Add to: remove team member, delete status, delete custom field, delete customer
- [ ] Dev: Add i18n keys: `confirmDelete`, `confirmRemove`, `areYouSure`
- [ ] Verify: Playwright — go to pipeline settings, click delete on a status
- [ ] Verify: Playwright — verify dialog appears with red "Delete status" button
- [ ] Verify: Playwright — click cancel, verify status still exists
- [ ] Verify: Playwright — click delete, verify status removed + toast shown
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 23. Webhooks: Add HMAC signature verification

- [ ] Dev: Add `secret` field to WebhookEndpoint model
- [ ] Dev: Generate HMAC secret on endpoint creation
- [ ] Dev: Verify `X-Webhook-Signature` header using HMAC-SHA256
- [ ] Dev: Return 401 for missing/invalid signatures
- [ ] Dev: Show secret in webhook management UI (copyable, hidden by default)
- [ ] Verify: curl — send request WITHOUT signature, verify 401 response
- [ ] Verify: curl — send request WITH correct HMAC signature, verify 200 + customer created
- [ ] Verify: curl — send request WITH wrong signature, verify 401
- [ ] Verify: Server logs — verify signature validation logs
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 24. Security: Add rate limiting to auth endpoints

- [ ] Dev: Install `hono-rate-limiter` or implement simple in-memory rate limiter
- [ ] Dev: Apply to `/api/auth/*` routes: 5 requests/minute per IP
- [ ] Dev: Return 429 Too Many Requests with Retry-After header
- [ ] Verify: curl — send 6 login requests in quick succession
- [ ] Verify: Verify first 5 return 200/401, 6th returns 429
- [ ] Verify: Server logs — verify rate limit hit logged
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 25. Security: Add consistent role enforcement

- [ ] Dev: Create `adminProcedure` extending `tenantProcedure` with role check
- [ ] Dev: Apply to: tenant.update, tenant.invite, tenant.removeMember, customerStatus CRUD, customField CRUD
- [ ] Dev: Return FORBIDDEN for MEMBER role on admin-only endpoints
- [ ] Verify: curl — create a MEMBER user, try to invite a team member, verify 403
- [ ] Verify: curl — same MEMBER tries to delete a status, verify 403
- [ ] Verify: curl — ADMIN user performs same actions, verify 200
- [ ] Verify: Server logs — verify FORBIDDEN errors logged correctly
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 26. Multi-tenancy: Add tenant isolation integration tests

- [ ] Dev: Create test file `apps/server/tests/tenant-isolation.test.ts`
- [ ] Dev: Test: User A creates customer → User B (different tenant) cannot list it
- [ ] Dev: Test: User B cannot update User A's customer
- [ ] Dev: Test: User B cannot see User A's conversations, notes, knowledge
- [ ] Dev: Test all tRPC procedures that use tenantProcedure
- [ ] Verify: Run tests — `cd apps/server && bun run test`
- [ ] Verify: All isolation tests pass
- [ ] Verify: CI — push and verify tests pass in CI too
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 27. i18n: Fix hardcoded English strings

- [ ] Dev: Search codebase for hardcoded English text in TSX files
- [ ] Dev: Move "Customer not found", "No activity yet" to i18n
- [ ] Dev: Move WhatsApp handoff messages to i18n
- [ ] Dev: Add matching Hebrew translations
- [ ] Verify: `bun run lint:i18n` — verify no hardcoded strings found
- [ ] Verify: Playwright — switch to Hebrew, navigate through pages, verify no English text leaked
- [ ] Verify: Playwright — screenshot of customer detail page in Hebrew
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 28. Multi-tenancy: Add tenant switching

- [ ] Dev: Add endpoint to list user's tenant memberships
- [ ] Dev: Add tenant selector dropdown in sidebar (if user has multiple tenants)
- [ ] Dev: Store selected tenant ID in session/localStorage
- [ ] Dev: Update tenantProcedure to use selected tenant instead of findFirst
- [ ] Verify: Seed a user with 2 tenants
- [ ] Verify: Playwright — login, verify tenant selector shows both tenants
- [ ] Verify: Playwright — switch tenant, verify dashboard data changes
- [ ] Verify: Playwright — verify customer list shows different customers per tenant
- [ ] Verify: Server logs — verify tenantId changes in request context
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

---

## Phase 2: P1 Important — Significantly Improves Experience (43 tasks)

### 29. Auth: Add onboarding guard

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Check tenant membership in /dashboard loader. Redirect to /onboarding if none. Redirect from /onboarding if already has tenant.
- Verify: Playwright — new user tries /dashboard → redirected to /onboarding. User with tenant tries /onboarding → redirected to /dashboard.

### 30. Auth: Add email verification flow

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Enable Better Auth email verification. Show "Verify your email" banner. Resend verification link button.
- Verify: Playwright — register, verify banner shows. curl — check verification endpoint.

### 31. Auth: Add password strength indicator

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Real-time checklist below password field (8+ chars, number, etc.). Green/red indicators.
- Verify: Playwright — type passwords of varying strength, screenshot showing indicator changes.

### 32. Auth: Add password visibility toggle

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Eye icon in password inputs. Toggle type text/password.
- Verify: Playwright — click eye icon, verify password becomes visible.

### 33. Auth: Add inline validation

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Validate fields on blur. Show error messages per field. aria-describedby.
- Verify: Playwright — fill invalid email, blur, verify error. Fill valid, verify error clears.

### 34. Auth: Add onboarding checklist

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Track completion of: add customer, set up WhatsApp, add KB entry, invite member. Show on dashboard.
- Verify: Playwright — new org sees checklist. Complete a step, verify checkbox updates.

### 35. Dashboard: Add conversion rate metric

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Calculate won/(won+lost). Show as percentage stat card.
- Verify: Seed won/lost customers. Playwright — verify percentage displays correctly.

### 36. Dashboard: Add date range filter

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Dropdown: Today, This Week, This Month, All Time. Filter all stats.
- Verify: Playwright — select "Today", verify stats change. Screenshot.

### 37. Dashboard: Add time-series chart

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Install recharts. Line chart for new customers over time.
- Verify: Seed customers with different dates. Playwright — verify chart renders.

### 38. Dashboard: Add bot vs human ratio chart

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Pie/donut chart. Count BOT vs HUMAN messages.
- Verify: Seed messages. Playwright — verify chart shows correct ratio.

### 39. Dashboard: Fix funnel N+1 query

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Use Prisma groupBy instead of N separate counts.
- Verify: Server logs — verify single query instead of N. Same data returned.

### 40. Dashboard: Add number formatting + empty state

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Intl.NumberFormat for comma separators. Empty state with action buttons for new orgs.
- Verify: Seed 1000+ customers. Playwright — verify "1,234" formatting. New org — verify empty state.

### 41. Kanban: Add drag visual feedback

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Placeholder in source. Drop zone highlighting. Optimistic update.
- Verify: Playwright — drag a card, screenshot during drag showing feedback.

### 42. Kanban: Add search/filter + card info

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Filter bar above kanban. Show email/assigned user on cards.
- Verify: Playwright — type in filter, verify cards filtered. Verify card shows extra info.

### 43. Table: Add row selection + bulk actions

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Checkbox column. Select all. Floating action bar: Assign, Status, Delete.
- Verify: Playwright — select 3 rows, change status in bulk, verify all updated.

### 44. Table: Add sticky header + search debounce

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: sticky thead. 300ms debounce on search. Status filter dropdown.
- Verify: Playwright — scroll down long table, verify header stays. Type fast, verify debounce.

### 45. Table: Add column visibility toggle + assigned user column

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Columns dropdown. Toggle columns. Add assigned user column.
- Verify: Playwright — hide email column, verify gone. Show assigned user, verify visible.

### 46. Customer Detail: Add unified timeline

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Merge activities + notes + messages chronologically. Resolve actor/author names.
- Verify: Playwright — seed activity + note + message, verify all in one timeline sorted by date.

### 47. Customer Detail: Add breadcrumb + delete

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Breadcrumb: Dashboard > Customers > Name. Delete button with confirmation.
- Verify: Playwright — verify breadcrumb shows correct path. Delete customer, verify redirected to list.

### 48. Timeline: Add type-specific icons + relative timestamps

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Install date-fns. Different icon/color per type. formatDistanceToNow for timestamps.
- Verify: Playwright — verify different icons for status change vs note. Verify "5 minutes ago" text.

### 49. Timeline: Add activity type filter

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Filter chips: All, Status Changes, Notes, Messages.
- Verify: Playwright — click "Notes", verify only notes shown. Click "All", verify all shown.

### 50. Chat: Add textarea + scroll-to-bottom + message grouping

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Replace input with auto-resize textarea. Shift+Enter newline. Group consecutive messages. Auto-scroll.
- Verify: Playwright — type multi-line message. Verify messages grouped. Verify auto-scroll on new message.

### 51. Chat: Add last message preview + conversation search

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Truncated last message in conversation list. Search bar for conversations.
- Verify: Playwright — verify preview text shown. Search customer name, verify filtered.

### 52. Chat: Add canned responses

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: "/" command opens canned response list. Select to insert. Tenant-configurable templates.
- Verify: Playwright — type "/", verify dropdown. Select template, verify inserted into input.

### 53. Bot: Add conversation summary on handoff

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Generate AI summary of conversation. Show to agent in chat header area.
- Verify: Trigger handoff. Playwright — verify summary banner shown in chat. Server logs — verify OpenAI call.

### 54. Bot: Add customizable system prompt

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Add botSystemPrompt field to tenant settings. UI textarea in settings. Use in bot flow.
- Verify: Playwright — edit prompt in settings. curl — trigger bot, verify custom prompt used (check server logs).

### 55. Bot: Add OpenAI error handling

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Try/catch around OpenAI calls. Graceful fallback: hand off to human with error message.
- Verify: Set invalid OPENAI_API_KEY. curl — trigger bot. Verify handoff happens, no crash. Server logs — error caught.

### 56. Knowledge: Add test query tool

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: "Ask a question" input on KB page. Run RAG pipeline, show chunks + answer.
- Verify: Add KB entry. Playwright — ask a question, verify answer shown with confidence score.

### 57. Knowledge: Add async embedding + error handling

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Return entry immediately with "processing" status. Background embed. Retry button on failure.
- Verify: Playwright — create entry, verify "processing" status. Wait, verify "ready". Server logs — pipeline log.

### 58. Automation: Add execution history + test run

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Log list per flow with timestamp/status/customer. Test run button.
- Verify: Trigger automation. Playwright — view flow, verify execution log shown. Test run — verify dry run results.

### 59. Automation: Add retry logic + drag-to-reorder

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Retry 1-3 times on failure. Drag handle to reorder steps.
- Verify: Simulate step failure. Server logs — verify retry attempts. Playwright — drag step, verify new order saved.

### 60. Webhooks: Add request logging + test button

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Store last 50 requests per endpoint. "Send test" button. Log viewer in UI.
- Verify: curl — send webhook. Playwright — view log, verify request appears. Click "Send test", verify response shown.

### 61. Webhooks: Add visual field mapping editor

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Dropdown-based mapping UI instead of raw JSON. Map external → Customer fields.
- Verify: Playwright — edit mapping, save. curl — send webhook with mapped fields. Verify customer created correctly.

### 62. Settings: Add sub-navigation + invite-by-link

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Tab bar within settings. Invite link generation with expiry.
- Verify: Playwright — navigate between settings tabs. Generate invite link, verify it works.

### 63. Settings: Add drag-to-reorder + inline editing

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Drag handles for pipeline statuses. Click to edit name/color inline. SELECT options editor.
- Verify: Playwright — drag status to reorder, verify order saved. Click name, edit inline, verify.

### 64. Search: Add Cmd+K + debounce + keyboard navigation

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Cmd/Ctrl+K shortcut. 300ms debounce. Arrow keys + Enter in results.
- Verify: Playwright — press Ctrl+K, verify search focused. Type, verify debounce. Arrow down, Enter, verify navigation.

### 65. Navigation: Add breadcrumbs + unread badge

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Breadcrumb component on all pages. Unread count badge on Conversations nav.
- Verify: Playwright — navigate to deep page, verify breadcrumb trail. Verify unread badge shows count.

### 66. Navigation: Add user info in sidebar + Link components

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Show user name/avatar above Sign Out. Replace `<a>` with `<Link>`.
- Verify: Playwright — verify user name shown in sidebar. Verify navigation works correctly with Link.

### 67. i18n: Format dates and numbers with locale

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Intl.DateTimeFormat with tenant locale. Intl.NumberFormat for all numbers.
- Verify: Playwright — set tenant language to "he", verify dates in Hebrew format. Verify "1,234" format.

### 68. i18n: Test RTL layout thoroughly

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Fix RTL issues: sidebar, kanban, chat bubbles, table alignment.
- Verify: Playwright — resize browser. Set lang=he. Screenshot every page. Verify all layouts correct in RTL.

### 69. Security: Add rate limiting to tRPC + webhooks

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: 100 req/min per user for tRPC. 60 req/min per token for webhooks.
- Verify: curl — burst 101 tRPC requests, verify 429 on 101st. Same for webhooks.

### 70. Security: Encrypt sensitive DB fields

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Encrypt greenApiToken before storing. Decrypt on read for API calls.
- Verify: Check DB directly — verify token is encrypted not plain text. Verify WhatsApp still works.

### 71. Mobile: Fix chat layout + kanban swipe

- [ ] Dev + Verify + Fix + Commit + CI Check
- Subtasks: Conversation list full-width on mobile. Tap → chat view. Back button. Kanban one-column-at-a-time with swipe.
- Verify: Playwright — resize to 375px. Navigate chat. Screenshot. Kanban swipe between columns.

---

## Phase 3: P2 Nice-to-Have (selected high-impact items, 20 tasks)

### 72. Auth: Add Google OAuth login

### 73. Dashboard: Add recent activity feed

### 74. Dashboard: Add clickable stat cards

### 75. Kanban: Add column collapse + WIP limits

### 76. Table: Add CSV export

### 77. Table: Add saved views

### 78. Customer Detail: Add tabbed layout

### 79. Timeline: Add rich text notes + @mentions

### 80. Chat: Add emoji picker + typing indicator

### 81. Chat: Add media message support

### 82. Bot: Add bot analytics dashboard

### 83. Bot: Add sentiment-based escalation

### 84. Knowledge: Add chunk preview + usage analytics

### 85. Automation: Add flow templates

### 86. Automation: Add visual flow diagram

### 87. Settings: Add "Danger Zone" + org deletion

### 88. Search: Convert to Cmd+K command palette

### 89. Navigation: Add collapsible sidebar + notifications

### 90. Cross-cutting: Add dark mode

### 91. Cross-cutting: Add keyboard shortcuts

Each P2 task follows the same verification framework:

- [ ] Dev
- [ ] Verify (Playwright + server logs + curl)
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check
