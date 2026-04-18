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

- [x] Dev: Enable Better Auth `forgetPassword` plugin in server.ts
- [x] Dev: Add "Forgot password?" link below password field on login page
- [x] Dev: Create `/reset-password` route with token-based password reset form
- [x] Dev: Add i18n keys for forgot password flow (en + he)
- [x] Verify: Playwright — navigate to /login, click "Forgot password?", verify page loads
- [x] Verify: curl — POST to /api/auth/forgot-password with test email, check 200 response
- [x] Verify: Server logs — no errors during password reset flow
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 2. Auth: Add auth guards to dashboard routes

- [x] Dev: Add session check in /dashboard layout route loader
- [x] Dev: Redirect unauthenticated users to /login
- [x] Dev: Store intended destination, redirect back after login
- [x] Verify: Playwright — navigate to /dashboard without auth, verify redirect to /login
- [x] Verify: Playwright — navigate to /dashboard/customers without auth, verify redirect
- [x] Verify: Playwright — login then verify redirect back to intended page
- [x] Verify: Server logs — no auth errors, clean 401 responses
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 3. Auth: Redirect authenticated users away from login/register

- [x] Dev: Check session in /login and /register route loaders
- [x] Dev: If session exists, redirect to /dashboard
- [x] Dev: Same for / (home page) — redirect to /dashboard if authenticated
- [x] Verify: Playwright — login, then navigate to /login, verify redirect to /dashboard
- [x] Verify: Playwright — navigate to /register while logged in, verify redirect
- [x] Verify: Playwright — navigate to / while logged in, verify redirect
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 4. Error: Add global React ErrorBoundary

- [x] Dev: Install `react-error-boundary` package
- [x] Dev: Wrap app root with ErrorBoundary showing "Something went wrong" + retry button
- [x] Dev: Add i18n keys: `somethingWentWrong`, `tryAgain`
- [x] Dev: Style error fallback with centered layout matching app design
- [x] Verify: Playwright — intentionally trigger an error (e.g., bad route), verify error boundary shows
- [x] Verify: Playwright — click retry button, verify it recovers
- [x] Verify: Console — verify error is caught, not an unhandled white screen
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 5. Error: Add toast notification system

- [x] Dev: Install `sonner` (toast library)
- [x] Dev: Add `<Toaster />` to root layout
- [x] Dev: Replace all inline error divs in mutations with toast.error()
- [x] Dev: Add toast.success() after successful mutations (settings save, customer create, etc.)
- [x] Verify: Playwright — create a customer, verify success toast appears
- [x] Verify: Playwright — trigger an error (e.g., duplicate slug), verify error toast appears
- [x] Verify: Playwright — screenshot showing toast notification
- [x] Verify: Check that old inline error divs are removed
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 6. Dashboard: Add loading skeletons for stats

- [x] Dev: Create `<StatCardSkeleton>` component with pulse animation
- [x] Dev: Create `<FunnelSkeleton>` component
- [x] Dev: Show skeletons while `statsQuery.isLoading` instead of "0" values
- [x] Verify: Playwright — navigate to /dashboard, take screenshot during loading (should see skeletons)
- [x] Verify: Playwright — wait for data, verify skeletons replaced with real values
- [x] Verify: Throttle network in Playwright to see skeletons clearly
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 7. Kanban: Make cards clickable to customer detail

- [x] Dev: Wrap card content in a clickable area (separate from drag handle)
- [x] Dev: onClick navigates to `/dashboard/customers/${customer.id}`
- [x] Dev: Add cursor-pointer styling distinct from drag cursor
- [x] Verify: Playwright — seed a customer, navigate to /dashboard/customers, click a card
- [x] Verify: Playwright — verify URL changed to /dashboard/customers/{id}
- [x] Verify: Playwright — verify customer detail page shows correct customer data
- [x] Verify: Playwright — verify drag still works (drag a card, check status change)
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 8. Kanban: Add "Add Customer" button

- [x] Dev: Add "Add Customer" button in page header
- [x] Dev: Create add customer modal/form with name, email, phone, status selector
- [x] Dev: Call customer.create mutation, refresh kanban on success
- [x] Dev: Add i18n keys for the form
- [x] Verify: Playwright — click "Add Customer" button, verify modal opens
- [x] Verify: Playwright — fill form, submit, verify new card appears in kanban
- [x] Verify: Playwright — verify customer appears in correct status column
- [x] Verify: Server logs — verify customer.create mutation succeeded
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 9. Table: Add row click navigation

- [x] Dev: Add onClick to each `<tr>` navigating to customer detail
- [x] Dev: Add cursor-pointer to rows
- [x] Dev: Ensure status dropdown click doesn't trigger row navigation (stopPropagation)
- [x] Verify: Playwright — switch to table view, click a customer row
- [x] Verify: Playwright — verify navigated to /dashboard/customers/{id}
- [x] Verify: Playwright — verify status dropdown still works without navigating
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 10. Table: Add "Add Customer" button

- [x] Dev: Reuse the same add customer modal from kanban task #8
- [x] Dev: Add button in table view header
- [x] Verify: Playwright — switch to table view, click "Add Customer"
- [x] Verify: Playwright — fill form, submit, verify customer appears in table
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 11. Customer Detail: Add inline editing

- [x] Dev: Make name, email, phone fields editable on click
- [x] Dev: Show input on click, save on blur/Enter, cancel on Escape
- [x] Dev: Call customer.update mutation on save
- [x] Dev: Show loading indicator during save
- [x] Verify: Playwright — navigate to customer detail, click name field
- [x] Verify: Playwright — type new name, press Enter, verify saved
- [x] Verify: Playwright — refresh page, verify new name persists
- [x] Verify: Server logs — verify customer.update mutation succeeded
- [x] Verify: Playwright — press Escape, verify edit cancelled (original value restored)
- [x] Fix if needed
- [x] Commit
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

- [ ] Dev: Check tenant membership in /dashboard layout route loader
- [ ] Dev: If no tenant membership, redirect to /onboarding
- [ ] Dev: In /onboarding, check if user already has a tenant, redirect to /dashboard
- [ ] Verify: Playwright — register new user, navigate to /dashboard, verify redirect to /onboarding
- [ ] Verify: Playwright — user with tenant navigates to /onboarding, verify redirect to /dashboard
- [ ] Verify: Server logs — no errors during redirects
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 30. Auth: Add email verification flow

- [ ] Dev: Enable Better Auth email verification plugin in server.ts
- [ ] Dev: Add "Verify your email" banner on dashboard for unverified users
- [ ] Dev: Add "Resend verification" button
- [ ] Dev: Add i18n keys: `verifyEmail`, `resendVerification`, `emailVerified`
- [ ] Verify: Playwright — register, navigate to dashboard, verify banner appears
- [ ] Verify: curl — POST to resend verification endpoint, check 200
- [ ] Verify: Server logs — no errors in verification flow
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 31. Auth: Add password strength indicator

- [ ] Dev: Create `<PasswordStrength>` component with checklist items
- [ ] Dev: Items: 8+ characters, contains number, contains uppercase, contains special char
- [ ] Dev: Green checkmark when met, red X when not, update in real-time as user types
- [ ] Dev: Add below password fields on register page
- [ ] Verify: Playwright — type "abc", verify all red. Type "Abc12345!", verify all green
- [ ] Verify: Playwright — screenshot showing mixed state
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 32. Auth: Add password visibility toggle

- [ ] Dev: Create eye/eye-off icon button inside password input
- [ ] Dev: Toggle input type between "password" and "text"
- [ ] Dev: Apply to login and register password fields
- [ ] Verify: Playwright — fill password, click eye icon, verify text visible
- [ ] Verify: Playwright — click again, verify text hidden
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 33. Auth: Add inline validation

- [ ] Dev: Validate email format on blur, show "Invalid email" if wrong
- [ ] Dev: Validate password length on blur
- [ ] Dev: Add `aria-describedby` linking error message to field
- [ ] Dev: Add `aria-invalid="true"` when field has error
- [ ] Verify: Playwright — fill "notanemail", blur, verify error message shown
- [ ] Verify: Playwright — fill valid email, blur, verify error clears
- [ ] Verify: Playwright — screenshot showing inline error
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 34. Auth: Add onboarding checklist

- [ ] Dev: Create OnboardingChecklist model or JSON field on Tenant
- [ ] Dev: Track: addedCustomer, setupWhatsApp, addedKBEntry, invitedMember
- [ ] Dev: Show checklist card on dashboard with checkmarks
- [ ] Dev: Auto-update when corresponding actions are completed
- [ ] Dev: Add i18n keys for checklist items
- [ ] Verify: Playwright — new org dashboard shows checklist with all unchecked
- [ ] Verify: Playwright — add a customer, refresh dashboard, verify "Add customer" checked
- [ ] Verify: Server logs — no errors in checklist tracking
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 35. Dashboard: Add conversion rate metric

- [ ] Dev: Add `getConversionRate` query — count Won / (Won + Lost)
- [ ] Dev: Add stat card showing percentage (e.g., "45.2%")
- [ ] Dev: Handle edge case: 0 won + 0 lost = show "N/A"
- [ ] Dev: Add i18n key: `conversionRate`
- [ ] Verify: Seed 3 Won + 2 Lost customers
- [ ] Verify: Playwright — verify stat card shows "60%"
- [ ] Verify: Playwright — new org shows "N/A" not "NaN"
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 36. Dashboard: Add date range filter

- [ ] Dev: Add dropdown above stats: Today, This Week, This Month, All Time
- [ ] Dev: Pass date range to getStats and getFunnel queries
- [ ] Dev: Filter by createdAt >= rangeStart
- [ ] Dev: Add i18n keys: `today`, `thisWeek`, `thisMonth`, `allTime`
- [ ] Verify: Seed customers across different dates
- [ ] Verify: Playwright — select "Today", verify stats show only today's customers
- [ ] Verify: Playwright — select "All Time", verify full count
- [ ] Verify: Playwright — screenshot showing filter dropdown
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 37. Dashboard: Add time-series chart

- [ ] Dev: Install recharts library
- [ ] Dev: Add `getCustomerTimeSeries` query returning daily counts for last 30 days
- [ ] Dev: Render LineChart component below stat cards
- [ ] Dev: Add i18n key: `newCustomersOverTime`
- [ ] Verify: Seed 50 customers across last 30 days
- [ ] Verify: Playwright — verify line chart renders with data points
- [ ] Verify: Playwright — screenshot of chart
- [ ] Verify: Console — no React rendering errors
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 38. Dashboard: Add bot vs human ratio chart

- [ ] Dev: Add `getBotHumanRatio` query counting messages by sender type
- [ ] Dev: Render PieChart/DonutChart showing BOT vs HUMAN percentages
- [ ] Dev: Add i18n keys: `botResponses`, `humanResponses`
- [ ] Verify: Seed BOT and HUMAN messages
- [ ] Verify: Playwright — verify pie chart renders with correct proportions
- [ ] Verify: Playwright — screenshot of chart
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 39. Dashboard: Fix funnel N+1 query

- [ ] Dev: Replace N separate `prisma.customer.count` calls with single `prisma.customer.groupBy`
- [ ] Dev: Group by statusId, join with status names/colors
- [ ] Dev: Verify same data returned as before
- [ ] Verify: Server logs — verify only 2 queries (statuses + groupBy) instead of N+1
- [ ] Verify: Playwright — verify funnel chart shows same data as before
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 40. Dashboard: Add number formatting + empty state

- [ ] Dev: Create `formatNumber()` utility using `Intl.NumberFormat`
- [ ] Dev: Apply to all stat card values
- [ ] Dev: Create `<DashboardEmptyState>` component for new orgs
- [ ] Dev: Show when all stats are 0: welcome message + action buttons
- [ ] Dev: Add i18n keys: `welcomeNewOrg`, `getStarted`
- [ ] Verify: Seed 1500 customers
- [ ] Verify: Playwright — verify stat card shows "1,500" not "1500"
- [ ] Verify: Playwright — new org (no data) shows empty state with action buttons
- [ ] Verify: Playwright — screenshot of empty state
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 41. Kanban: Add drag visual feedback

- [ ] Dev: Install dnd-kit library for proper drag-and-drop
- [ ] Dev: Show semi-transparent placeholder in source column
- [ ] Dev: Highlight drop target column with border/background change
- [ ] Dev: Add optimistic update — move card in UI immediately, revert on error
- [ ] Verify: Playwright — drag a card, take screenshot during drag
- [ ] Verify: Playwright — drop card, verify it moved to new column
- [ ] Verify: Playwright — verify no full-page flicker (optimistic update)
- [ ] Verify: Server logs — verify changeStatus mutation succeeded
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 42. Kanban: Add search/filter + card info

- [ ] Dev: Add search input above kanban board
- [ ] Dev: Filter cards by name/phone as user types (client-side for kanban)
- [ ] Dev: Show email and assigned user avatar/initials on each card
- [ ] Dev: Add i18n key: `filterCustomers`
- [ ] Verify: Playwright — type customer name in filter, verify only matching cards shown
- [ ] Verify: Playwright — clear filter, verify all cards return
- [ ] Verify: Playwright — verify card shows email and assigned user info
- [ ] Verify: Playwright — screenshot of enriched card
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 43. Table: Add row selection + bulk actions

- [ ] Dev: Add checkbox column as first column in table
- [ ] Dev: Add "Select all" checkbox in header
- [ ] Dev: When rows selected, show floating action bar at bottom
- [ ] Dev: Action bar buttons: "Change Status", "Assign To", "Delete"
- [ ] Dev: Implement bulk status change calling customer.bulkUpdate
- [ ] Verify: Playwright — check 3 customer rows, verify action bar appears
- [ ] Verify: Playwright — click "Change Status", select new status, verify all 3 updated
- [ ] Verify: curl — GET customers, verify statuses changed in DB
- [ ] Verify: Playwright — screenshot of action bar
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 44. Table: Add sticky header + search debounce

- [ ] Dev: Add `position: sticky; top: 0; z-index: 10` to thead
- [ ] Dev: Add 300ms debounce to search input using setTimeout/useRef
- [ ] Dev: Add status filter dropdown next to search
- [ ] Verify: Seed 50+ customers
- [ ] Verify: Playwright — scroll down, verify header stays visible
- [ ] Verify: Playwright — type fast in search, verify only 1 API call after 300ms pause
- [ ] Verify: Playwright — filter by status, verify table shows only matching
- [ ] Verify: Server logs — verify debounced requests (not one per keystroke)
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 45. Table: Add column visibility toggle + assigned user column

- [ ] Dev: Add "Columns" dropdown button in table header area
- [ ] Dev: Checkbox per column to show/hide
- [ ] Dev: Persist column visibility in localStorage
- [ ] Dev: Add "Assigned To" column showing user name
- [ ] Verify: Playwright — click Columns dropdown, uncheck "Email", verify column hidden
- [ ] Verify: Playwright — refresh page, verify column stays hidden (localStorage)
- [ ] Verify: Playwright — verify Assigned To column shows user names
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 46. Customer Detail: Add unified timeline

- [ ] Dev: Create unified query merging activities + notes + messages by date
- [ ] Dev: Render single chronological feed with type-specific styling
- [ ] Dev: Resolve actorId/authorId to user names (join with User table)
- [ ] Dev: Show "John Doe changed status from X to Y" instead of "Status changed"
- [ ] Verify: Seed customer with activity + note + message
- [ ] Verify: Playwright — verify all 3 types appear in one timeline
- [ ] Verify: Playwright — verify chronological order (newest first or oldest first)
- [ ] Verify: Playwright — verify user names shown, not IDs
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 47. Customer Detail: Add breadcrumb + delete

- [ ] Dev: Create `<Breadcrumb>` component: Dashboard > Customers > {name}
- [ ] Dev: Each segment is a clickable link
- [ ] Dev: Add "Delete" button in customer detail header
- [ ] Dev: Use `<ConfirmDialog>` from task #22 before deleting
- [ ] Dev: After delete, redirect to /dashboard/customers
- [ ] Verify: Playwright — navigate to customer detail, verify breadcrumb shows correct path
- [ ] Verify: Playwright — click "Customers" in breadcrumb, verify navigates to list
- [ ] Verify: Playwright — click Delete, confirm, verify redirected to customer list
- [ ] Verify: curl — GET deleted customer, verify 404
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 48. Timeline: Add type-specific icons + relative timestamps

- [ ] Dev: Install date-fns
- [ ] Dev: Use `formatDistanceToNow` for timestamps ("5 minutes ago")
- [ ] Dev: Show absolute timestamp on hover (tooltip)
- [ ] Dev: Add icons per activity type using Lucide icons
- [ ] Dev: Color code: blue=status, yellow=note, purple=assignment, green=created, teal=message
- [ ] Verify: Playwright — verify different icons for status change vs note
- [ ] Verify: Playwright — verify "5 minutes ago" text (not "2026-04-18T...")
- [ ] Verify: Playwright — hover timestamp, verify tooltip shows absolute date
- [ ] Verify: Playwright — screenshot of colored timeline
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 49. Timeline: Add activity type filter

- [ ] Dev: Add filter chips above timeline: All, Status Changes, Notes, Messages
- [ ] Dev: Filter activities client-side based on selected type
- [ ] Dev: Highlight active filter chip
- [ ] Verify: Playwright — click "Notes", verify only notes shown
- [ ] Verify: Playwright — click "Status Changes", verify only status changes shown
- [ ] Verify: Playwright — click "All", verify all items return
- [ ] Verify: Playwright — screenshot of filtered timeline
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 50. Chat: Add textarea + scroll-to-bottom + message grouping

- [ ] Dev: Replace single-line `<input>` with auto-resize `<textarea>`
- [ ] Dev: Shift+Enter inserts newline, Enter sends message
- [ ] Dev: Auto-resize textarea up to 4 lines
- [ ] Dev: Group consecutive messages from same sender within 1 minute
- [ ] Dev: Add auto-scroll to bottom on new messages
- [ ] Dev: Add "New messages ↓" button when user has scrolled up
- [ ] Verify: Playwright — type multi-line message with Shift+Enter, verify newline works
- [ ] Verify: Playwright — press Enter, verify message sent
- [ ] Verify: Playwright — verify consecutive messages grouped (shared bubble)
- [ ] Verify: Playwright — send message, verify auto-scrolled to bottom
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 51. Chat: Add last message preview + conversation search

- [ ] Dev: Include last message text in conversation.list query
- [ ] Dev: Show truncated last message (50 chars) under customer name in list
- [ ] Dev: Show relative timestamp of last message
- [ ] Dev: Add search input above conversation list
- [ ] Dev: Filter conversations by customer name
- [ ] Verify: Playwright — verify conversation list shows message previews
- [ ] Verify: Playwright — type customer name in search, verify filtered
- [ ] Verify: Playwright — clear search, verify all conversations return
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 52. Chat: Add canned responses

- [ ] Dev: Create CannedResponse model (tenantId, shortcut, body)
- [ ] Dev: Add canned response management in Settings
- [ ] Dev: In chat input, detect "/" at start, show dropdown of responses
- [ ] Dev: Select response to insert its body into the textarea
- [ ] Verify: Playwright — go to settings, create canned response "/hello" = "Hello! How can I help?"
- [ ] Verify: Playwright — go to chat, type "/", verify dropdown shows
- [ ] Verify: Playwright — select "/hello", verify text inserted in textarea
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 53. Bot: Add conversation summary on handoff

- [ ] Dev: When bot hands off, generate 2-3 sentence summary via OpenAI
- [ ] Dev: Store summary in Conversation model (handoffSummary field)
- [ ] Dev: Show summary banner at top of chat when agent opens handoff conversation
- [ ] Dev: Add i18n key: `handoffSummary`
- [ ] Verify: curl — trigger a handoff scenario
- [ ] Verify: Server logs — verify OpenAI summary call made
- [ ] Verify: Playwright — open the handed-off conversation, verify summary banner shown
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 54. Bot: Add customizable system prompt

- [ ] Dev: Add `botSystemPrompt` text field to Tenant model
- [ ] Dev: Add textarea in Settings → WhatsApp section for editing prompt
- [ ] Dev: Use tenant.botSystemPrompt in whatsapp-webhook.ts (fallback to default)
- [ ] Verify: Playwright — go to settings, edit system prompt, save
- [ ] Verify: curl — trigger bot, check server logs for custom prompt being used
- [ ] Verify: Playwright — verify toast confirmation on save
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 55. Bot: Add OpenAI error handling

- [ ] Dev: Wrap all OpenAI calls in try/catch in whatsapp-webhook.ts
- [ ] Dev: On error: hand off to human, send tenant-language error message
- [ ] Dev: Log error with context (conversationId, customerId)
- [ ] Verify: Temporarily set invalid OPENAI_API_KEY
- [ ] Verify: curl — send WhatsApp webhook triggering bot
- [ ] Verify: Server logs — verify error caught gracefully, no crash
- [ ] Verify: curl — check conversation.isBot = false (handed off)
- [ ] Verify: Restore valid API key
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 56. Knowledge: Add test query tool

- [ ] Dev: Add "Test a question" section on knowledge base page
- [ ] Dev: Input field + "Ask" button
- [ ] Dev: Create tRPC procedure that runs RAG pipeline and returns: chunks, scores, answer
- [ ] Dev: Display results: retrieved chunks with scores, generated answer
- [ ] Verify: Seed a knowledge entry
- [ ] Verify: Playwright — type a related question, click Ask
- [ ] Verify: Playwright — verify chunks displayed with confidence scores
- [ ] Verify: Playwright — verify generated answer shown
- [ ] Verify: Server logs — verify RAG pipeline executed
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 57. Knowledge: Add async embedding + error handling

- [ ] Dev: Add `status` field to KnowledgeEntry: "processing" | "ready" | "failed"
- [ ] Dev: Return entry immediately with status="processing"
- [ ] Dev: Run embed pipeline in background (setTimeout or queue)
- [ ] Dev: Update status to "ready" on success, "failed" on error
- [ ] Dev: Show status badge on entry cards in UI
- [ ] Dev: Add "Retry" button for failed entries
- [ ] Verify: Playwright — create text entry, verify "processing" status shown
- [ ] Verify: Playwright — wait 5-10 seconds, refresh, verify "ready" status
- [ ] Verify: Server logs — verify background pipeline completed
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 58. Automation: Add execution history + test run

- [ ] Dev: Create execution history view on flow detail page
- [ ] Dev: Show list: timestamp, customer name, status (success/failed), step details
- [ ] Dev: Add "Test Run" button that executes flow in dry-run mode (no actual messages sent)
- [ ] Dev: Show test results inline: each step's pass/fail status
- [ ] Verify: Trigger an automation flow
- [ ] Verify: Playwright — open flow detail, verify execution log appears
- [ ] Verify: Playwright — click "Test Run", select a customer, verify results shown
- [ ] Verify: Server logs — verify dry-run didn't send real messages
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 59. Automation: Add retry logic + drag-to-reorder

- [ ] Dev: Add retryCount config per step (default 1, max 3)
- [ ] Dev: On step failure, retry with exponential backoff (1s, 2s, 4s)
- [ ] Dev: Log each retry attempt in AutomationLog
- [ ] Dev: Add drag handles to step cards in flow editor
- [ ] Dev: Reorder steps via drag-and-drop, save new order
- [ ] Verify: Create a flow with a step that will fail
- [ ] Verify: Server logs — verify retry attempts logged
- [ ] Verify: Playwright — drag step 2 above step 1, save, verify order changed
- [ ] Verify: Playwright — reload page, verify new order persisted
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 60. Webhooks: Add request logging + test button

- [ ] Dev: Create WebhookLog model (endpointId, timestamp, status, payload, response)
- [ ] Dev: Log every incoming request in webhook-ingestion.ts
- [ ] Dev: Show last 20 logs per endpoint in UI
- [ ] Dev: Add "Send Test" button that POSTs a sample payload to the endpoint
- [ ] Dev: Show test result (success/failure + response body)
- [ ] Verify: curl — send a webhook request
- [ ] Verify: Playwright — open webhook detail, verify request log appears
- [ ] Verify: Playwright — click "Send Test", verify result shown
- [ ] Verify: Server logs — verify logging works
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 61. Webhooks: Add visual field mapping editor

- [ ] Dev: Replace raw JSON field mapping with dropdown-based UI
- [ ] Dev: Left column: external field name (text input)
- [ ] Dev: Right column: dropdown of Customer fields (name, email, phone, + custom fields)
- [ ] Dev: Add/remove mapping rows with + / - buttons
- [ ] Dev: Save as JSON to the existing fieldMapping field
- [ ] Verify: Playwright — add mapping "full_name" → "name", save
- [ ] Verify: curl — send webhook with `{"full_name": "Test"}`, verify customer created with name "Test"
- [ ] Verify: Playwright — screenshot of field mapping editor
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 62. Settings: Add sub-navigation + invite-by-link

- [ ] Dev: Add tab bar at top of settings pages: General, Team, Pipeline, Custom Fields
- [ ] Dev: Highlight active tab based on current route
- [ ] Dev: Add "Generate Invite Link" button on team page
- [ ] Dev: Create invite link with token and expiry (7 days)
- [ ] Dev: Show copyable invite URL
- [ ] Verify: Playwright — navigate to /dashboard/settings, verify tabs shown
- [ ] Verify: Playwright — click "Team" tab, verify team page loads
- [ ] Verify: Playwright — click "Generate Invite Link", verify URL shown
- [ ] Verify: Playwright — copy URL, verify it's a valid link format
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 63. Settings: Add drag-to-reorder + inline editing

- [ ] Dev: Add drag handles to pipeline status items
- [ ] Dev: Reorder via drag-and-drop, call customerStatus.reorder on drop
- [ ] Dev: Click status name to edit inline, save on blur
- [ ] Dev: Click color swatch to change color, save immediately
- [ ] Dev: Add options editor for SELECT/MULTI_SELECT custom fields
- [ ] Verify: Playwright — drag "Contacted" above "New", verify new order saved
- [ ] Verify: Playwright — click status name, type new name, blur, verify saved
- [ ] Verify: Playwright — reload page, verify order and name persisted
- [ ] Verify: Server logs — verify reorder mutation succeeded
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 64. Search: Add Cmd+K + debounce + keyboard navigation

- [ ] Dev: Add global keydown listener for Cmd/Ctrl+K
- [ ] Dev: Focus search input (or open command palette modal)
- [ ] Dev: Add 300ms debounce using setTimeout/useRef
- [ ] Dev: Track highlighted result index with arrow keys
- [ ] Dev: Enter navigates to highlighted result, Escape closes
- [ ] Verify: Playwright — press Ctrl+K, verify search focused
- [ ] Verify: Playwright — type query, wait 300ms, verify single API call
- [ ] Verify: Playwright — press ArrowDown twice, press Enter, verify navigation
- [ ] Verify: Playwright — press Escape, verify search closes
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 65. Navigation: Add breadcrumbs + unread badge

- [ ] Dev: Create `<Breadcrumb>` component using route path segments
- [ ] Dev: Add to all dashboard pages: Dashboard > Module > Detail
- [ ] Dev: Add unread message count query
- [ ] Dev: Show red badge with count on "Conversations" nav item
- [ ] Verify: Playwright — navigate to /dashboard/customers/123, verify breadcrumb "Dashboard > Customers > Customer Name"
- [ ] Verify: Playwright — seed unread messages, verify badge shows count
- [ ] Verify: Playwright — read all messages, verify badge disappears
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 66. Navigation: Add user info in sidebar + Link components

- [ ] Dev: Fetch current user name in dashboard layout
- [ ] Dev: Show user name/initials avatar above "Sign Out" in sidebar
- [ ] Dev: Replace all `<a>` + `navigate()` with proper `<Link>` components
- [ ] Dev: Fix all `as '/'` type casts with proper route typing
- [ ] Verify: Playwright — verify user name shown in sidebar bottom
- [ ] Verify: Playwright — click each nav link, verify navigation works without full page reload
- [ ] Verify: Console — verify no type errors or navigation warnings
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 67. i18n: Format dates and numbers with locale

- [ ] Dev: Create `formatDate()` utility using `Intl.DateTimeFormat` with tenant locale
- [ ] Dev: Create `formatNumber()` utility using `Intl.NumberFormat`
- [ ] Dev: Replace all `toLocaleDateString()` / `toLocaleString()` calls
- [ ] Dev: Replace all raw number displays with `formatNumber()`
- [ ] Verify: Playwright — set tenant language to "he", navigate to dashboard
- [ ] Verify: Playwright — verify dates show in Hebrew format
- [ ] Verify: Playwright — verify numbers show with proper formatting
- [ ] Verify: Playwright — screenshot of Hebrew-formatted page
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 68. i18n: Test RTL layout thoroughly

- [ ] Dev: Set language to Hebrew, navigate through every page
- [ ] Dev: Fix sidebar direction (should be on the right in RTL)
- [ ] Dev: Fix kanban scroll direction
- [ ] Dev: Fix chat bubbles (outbound should be on the left in RTL)
- [ ] Dev: Fix table text alignment
- [ ] Dev: Fix any `translate-x` that doesn't respect RTL
- [ ] Verify: Playwright — set lang=he, take screenshot of dashboard
- [ ] Verify: Playwright — take screenshot of customers kanban in RTL
- [ ] Verify: Playwright — take screenshot of conversations in RTL
- [ ] Verify: Playwright — take screenshot of settings in RTL
- [ ] Verify: Verify all screenshots show correct RTL layout
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 69. Security: Add rate limiting to tRPC + webhooks

- [ ] Dev: Add rate limiting middleware to Hono for `/trpc/*` routes
- [ ] Dev: Limit: 100 requests/minute per authenticated user
- [ ] Dev: Add rate limiting to webhook ingestion: 60 req/min per token
- [ ] Dev: Return 429 Too Many Requests with Retry-After header
- [ ] Verify: curl — send 101 tRPC requests rapidly, verify 101st returns 429
- [ ] Verify: curl — send 61 webhook requests, verify 61st returns 429
- [ ] Verify: Server logs — verify rate limit events logged
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 70. Security: Encrypt sensitive DB fields

- [ ] Dev: Create encrypt/decrypt utility using Node crypto (AES-256-GCM)
- [ ] Dev: Encrypt `greenApiToken` before saving to DB
- [ ] Dev: Decrypt when reading for WhatsApp API calls
- [ ] Dev: Store encryption key in env var `ENCRYPTION_KEY`
- [ ] Verify: Save a WhatsApp token in settings
- [ ] Verify: Query DB directly (mongosh), verify token is encrypted (not plain text)
- [ ] Verify: Verify WhatsApp API calls still work with decrypted token
- [ ] Verify: Server logs — no errors in encrypt/decrypt flow
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 71. Mobile: Fix chat layout + kanban swipe

- [ ] Dev: At <768px, conversation list takes full width
- [ ] Dev: Tapping conversation navigates to full-screen chat view
- [ ] Dev: Add "Back" button in chat header to return to list
- [ ] Dev: At <768px, kanban shows one column at a time with swipe
- [ ] Dev: Add left/right swipe or arrow buttons to navigate columns
- [ ] Verify: Playwright — resize to 375px width
- [ ] Verify: Playwright — navigate to conversations, verify full-width list
- [ ] Verify: Playwright — tap conversation, verify full-screen chat
- [ ] Verify: Playwright — navigate to customers kanban, verify single column view
- [ ] Verify: Playwright — screenshot of mobile chat
- [ ] Verify: Playwright — screenshot of mobile kanban
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

---

## Phase 3: P2 Nice-to-Have (selected high-impact items, 20 tasks)

### 72. Auth: Add Google OAuth login

- [ ] Dev: Enable Better Auth Google provider in server.ts
- [ ] Dev: Add Google client ID/secret to env
- [ ] Dev: Add "Continue with Google" button on login/register pages
- [ ] Verify: Playwright — verify Google button shows on login page
- [ ] Verify: Click Google button, verify OAuth flow starts
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 73. Dashboard: Add recent activity feed

- [ ] Dev: Query last 10 activities across all customers
- [ ] Dev: Show as timeline card on dashboard below charts
- [ ] Dev: Each item links to the relevant customer
- [ ] Verify: Playwright — seed activities, verify feed shows on dashboard
- [ ] Verify: Playwright — click activity, verify navigates to customer
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 74. Dashboard: Add clickable stat cards

- [ ] Dev: Wrap stat cards in clickable links
- [ ] Dev: "Total Customers" → /dashboard/customers
- [ ] Dev: "Active Conversations" → /dashboard/conversations
- [ ] Verify: Playwright — click "Total Customers" card, verify navigates to customers page
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 75. Kanban: Add column collapse + WIP limits

- [ ] Dev: Click column header to collapse to header-only (saves space)
- [ ] Dev: Add optional WIP limit per status in settings
- [ ] Dev: Show warning color when column exceeds limit
- [ ] Verify: Playwright — collapse a column, verify it minimizes
- [ ] Verify: Playwright — set WIP limit to 3, add 4th card, verify warning
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 76. Table: Add CSV export

- [ ] Dev: Add "Export CSV" button in table header
- [ ] Dev: Export current filtered view as CSV file
- [ ] Dev: Include all visible columns
- [ ] Verify: Playwright — click Export, verify file downloaded
- [ ] Verify: Open CSV, verify correct data and columns
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 77. Table: Add saved views

- [ ] Dev: Create SavedView model (tenantId, name, filters, columns, sort)
- [ ] Dev: Add "Save View" button and view tabs above table
- [ ] Dev: Load saved view on tab click
- [ ] Verify: Playwright — configure filters, save as "Hot Leads", verify tab appears
- [ ] Verify: Playwright — click tab, verify filters restored
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 78. Customer Detail: Add tabbed layout

- [ ] Dev: Add tab bar: Overview, Activity, Conversations, Notes
- [ ] Dev: Show relevant content per tab
- [ ] Dev: Remember last active tab in localStorage
- [ ] Verify: Playwright — switch between tabs, verify content changes
- [ ] Verify: Playwright — refresh, verify last tab remembered
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 79. Timeline: Add rich text notes + @mentions

- [ ] Dev: Add markdown rendering for note body (bold, italic, lists)
- [ ] Dev: Add `@` trigger to mention team members
- [ ] Dev: Notify mentioned users
- [ ] Verify: Playwright — create note with **bold** text, verify rendered as bold
- [ ] Verify: Playwright — type `@`, verify member dropdown, select, verify mention
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 80. Chat: Add emoji picker + typing indicator

- [ ] Dev: Add emoji picker button next to send button
- [ ] Dev: Insert selected emoji into textarea
- [ ] Dev: Show "Customer is typing..." when green-api reports typing
- [ ] Verify: Playwright — click emoji button, select emoji, verify inserted
- [ ] Verify: Playwright — verify typing indicator area exists
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 81. Chat: Add media message support

- [ ] Dev: Display image/file messages from WhatsApp (media URLs)
- [ ] Dev: Add file upload button in chat input
- [ ] Dev: Send media via green-api sendFileByUrl
- [ ] Verify: Playwright — receive image message, verify image renders in chat
- [ ] Verify: Playwright — upload and send an image, verify sent
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 82. Bot: Add bot analytics dashboard

- [ ] Dev: Track metrics: bot response count, handoff count, avg confidence
- [ ] Dev: Create analytics section in dashboard or settings
- [ ] Dev: Show charts: response rate over time, top questions
- [ ] Verify: Seed bot interactions
- [ ] Verify: Playwright — navigate to bot analytics, verify charts render
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 83. Bot: Add sentiment-based escalation

- [ ] Dev: Analyze customer message sentiment using OpenAI
- [ ] Dev: If negative sentiment detected 2+ times, auto-escalate
- [ ] Dev: Log sentiment score per message
- [ ] Verify: curl — send angry messages, verify escalation triggered
- [ ] Verify: Server logs — verify sentiment analysis ran
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 84. Knowledge: Add chunk preview + usage analytics

- [ ] Dev: Show expandable chunk list on each entry detail view
- [ ] Dev: Track chunk retrieval counts in Qdrant metadata
- [ ] Dev: Show "Used 15 times this week" on entry cards
- [ ] Verify: Playwright — expand entry, verify chunks displayed
- [ ] Verify: Playwright — verify usage count shown
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 85. Automation: Add flow templates

- [ ] Dev: Create template list: Welcome, Follow-up, Re-engage, Win-back
- [ ] Dev: "Create from template" button on automations page
- [ ] Dev: Pre-fill trigger + steps from template
- [ ] Verify: Playwright — click "Create from template", select "Welcome"
- [ ] Verify: Playwright — verify flow pre-filled with welcome steps
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 86. Automation: Add visual flow diagram

- [ ] Dev: Render read-only vertical node graph of flow
- [ ] Dev: Show trigger at top, steps as connected nodes
- [ ] Dev: Color-code by step type
- [ ] Verify: Playwright — view flow with 3 steps, verify diagram renders
- [ ] Verify: Playwright — screenshot of visual flow
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 87. Settings: Add "Danger Zone" + org deletion

- [ ] Dev: Add red "Danger Zone" section at bottom of tenant settings
- [ ] Dev: "Delete Organization" button with double confirmation (type org name)
- [ ] Dev: Delete all tenant data cascade
- [ ] Dev: Redirect to / after deletion
- [ ] Verify: Playwright — scroll to danger zone, click Delete
- [ ] Verify: Playwright — type wrong name, verify button stays disabled
- [ ] Verify: Playwright — type correct name, delete, verify redirected
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 88. Search: Convert to Cmd+K command palette

- [ ] Dev: Replace inline search bar with modal command palette
- [ ] Dev: Support commands: search, navigate, create customer
- [ ] Dev: Show recent commands
- [ ] Verify: Playwright — Cmd+K opens modal, type "cust", verify results
- [ ] Verify: Playwright — Escape closes modal
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 89. Navigation: Add collapsible sidebar + notifications

- [ ] Dev: Add collapse button to minimize sidebar to icons only (56px)
- [ ] Dev: Persist collapsed state in localStorage
- [ ] Dev: Add notification bell icon in header
- [ ] Dev: Notification dropdown: new messages, handoffs, invites
- [ ] Verify: Playwright — click collapse, verify sidebar shrinks to icons
- [ ] Verify: Playwright — click bell, verify notification dropdown
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 90. Cross-cutting: Add dark mode

- [ ] Dev: Add dark mode toggle in header (sun/moon icon)
- [ ] Dev: Use Tailwind `dark:` class variants
- [ ] Dev: Persist preference in localStorage
- [ ] Dev: Respect system preference as default
- [ ] Verify: Playwright — click dark mode toggle, verify colors change
- [ ] Verify: Playwright — screenshot of dark mode dashboard
- [ ] Verify: Playwright — refresh, verify dark mode persisted
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check

### 91. Cross-cutting: Add keyboard shortcuts

- [ ] Dev: Add global keyboard listener for shortcuts
- [ ] Dev: `n` = new customer modal, Cmd+K = search, `?` = show shortcuts help
- [ ] Dev: Create shortcuts help dialog showing all available shortcuts
- [ ] Verify: Playwright — press `n`, verify new customer modal opens
- [ ] Verify: Playwright — press `?`, verify help dialog shows
- [ ] Fix if needed
- [ ] Commit
- [ ] CI Check
