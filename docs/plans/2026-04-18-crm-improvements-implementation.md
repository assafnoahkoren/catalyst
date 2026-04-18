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
- [x] CI Check

### 12. Customer Detail: Add status change

- [x] Dev: Replace status badge with clickable dropdown
- [x] Dev: Show all statuses from customerStatus.list
- [x] Dev: Call customer.changeStatus on selection
- [x] Dev: Verify activity is created automatically
- [x] Verify: Playwright — navigate to customer detail, click status badge
- [x] Verify: Playwright — select new status, verify badge changes
- [x] Verify: Playwright — verify activity timeline shows "Status changed: X → Y"
- [x] Verify: curl — GET customer by ID, verify statusId changed
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 13. Customer Detail: Display custom fields

- [x] Dev: Fetch CustomFieldDefinitions for tenant
- [x] Dev: Render each custom field value from customer.customFields JSON
- [x] Dev: Use appropriate input type per field type (text, number, date, select, etc.)
- [x] Dev: Make custom fields editable inline
- [x] Verify: Playwright — seed customer with custom fields + definitions
- [x] Verify: Playwright — navigate to customer detail, verify custom fields displayed
- [x] Verify: Playwright — edit a custom field, save, verify persisted
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 14. Chat: Add real-time message updates

- [x] Dev: Add polling interval (5s) to messages query when a conversation is selected
- [x] Dev: Use `refetchInterval: 5000` on the messages query
- [x] Dev: Also refetch conversation list every 10s for updated timestamps
- [x] Verify: Playwright — open conversations page, select a conversation
- [x] Verify: curl — POST a new message via tRPC to the same conversation
- [x] Verify: Playwright — wait 5-6 seconds, verify new message appears without manual action
- [x] Verify: Server logs — verify polling requests are working (no errors)
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 15. Chat: Add unread message count

- [x] Dev: Add `lastReadAt` field to Conversation model (or track per-user)
- [x] Dev: Calculate unread count in conversation.list query
- [x] Dev: Show badge with count on each conversation in the sidebar list
- [x] Dev: Show total unread badge on "Conversations" nav item in sidebar
- [x] Dev: Update lastReadAt when user opens a conversation
- [x] Verify: Playwright — seed messages, navigate to conversations, verify badges show counts
- [x] Verify: Playwright — click a conversation, verify its badge disappears
- [x] Verify: Playwright — verify sidebar nav badge shows remaining unread total
- [x] Verify: Server logs — no errors in unread calculation
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 16. Bot: Translate handoff messages using tenant language

- [x] Dev: Create handoff message templates per language in i18n
- [x] Dev: Replace hardcoded English "Connecting you..." with `t()` lookup based on tenant.language
- [x] Dev: Add keys: `botHandoffConnecting`, `botHandoffLowConfidence` (en + he)
- [x] Verify: curl — set tenant language to "he", trigger handoff via WhatsApp webhook
- [x] Verify: Server logs — verify Hebrew handoff message was sent
- [x] Verify: curl — check message in DB has Hebrew text
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 17. Bot: Add handoff notification to team

- [x] Dev: When bot sets isBot=false, emit event (SSE or polling flag)
- [x] Dev: Add a "needs attention" indicator on conversation list (orange/red highlight)
- [x] Dev: Add browser notification permission request
- [x] Dev: Send browser notification on handoff
- [x] Verify: Playwright — trigger a handoff scenario (low confidence or keyword)
- [x] Verify: Playwright — verify conversation shows "needs attention" indicator
- [x] Verify: Server logs — verify handoff event was created
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 18. Knowledge: Implement real PDF/DOCX parsing

- [x] Dev: Install `pdf-parse` and `mammoth` packages
- [x] Dev: Update `parseFile()` to use proper parsers based on mimeType
- [x] Dev: Handle parsing errors gracefully
- [x] Verify: Create a test PDF and DOCX file
- [x] Verify: curl — upload PDF via knowledge endpoint, verify text extracted correctly
- [x] Verify: curl — upload DOCX, verify text extracted
- [x] Verify: Server logs — no parsing errors
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 19. Knowledge: Add file upload endpoint

- [x] Dev: Create Hono route accepting multipart/form-data
- [x] Dev: Parse uploaded file, chunk, embed, store
- [x] Dev: Add upload form to knowledge/new page (drag-and-drop dropzone)
- [x] Dev: Show upload progress (parsing → chunking → embedding → done)
- [x] Verify: Playwright — navigate to /dashboard/knowledge/new
- [x] Verify: Playwright — upload a .txt file via the form
- [x] Verify: Playwright — verify entry appears in knowledge list with chunk count > 0
- [x] Verify: Server logs — verify embedding pipeline completed without errors
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 20. Automation: Wire triggers into actual flows

- [x] Dev: In customer.changeStatus router, call `findMatchingFlows()` + `executeFlow()`
- [x] Dev: In webhook handler, call triggers after customer creation
- [x] Dev: In WhatsApp webhook, call triggers on message received
- [x] Dev: Start automation scheduler in server index.ts
- [x] Verify: curl — create an automation flow with trigger STATUS_CHANGE
- [x] Verify: curl — change a customer's status
- [x] Verify: Server logs — verify automation engine fired and executed steps
- [x] Verify: curl — check AutomationLog for execution record
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 21. Settings: Add save confirmation feedback (toast)

- [x] Dev: Add toast.success() after tenant.update mutation succeeds
- [x] Dev: Add toast.success() after team invite succeeds
- [x] Dev: Add toast.success() after status create/delete succeeds
- [x] Dev: Add toast.success() after custom field create/delete succeeds
- [x] Verify: Playwright — go to settings, change org name, save, verify toast appears
- [x] Verify: Playwright — go to pipeline settings, add status, verify toast
- [x] Verify: Playwright — screenshot showing success toast
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 22. Settings: Add confirmation dialogs for destructive actions

- [x] Dev: Create `<ConfirmDialog>` component with title, message, confirm/cancel buttons
- [x] Dev: Use red confirm button with verb+noun label ("Delete status")
- [x] Dev: Add to: remove team member, delete status, delete custom field, delete customer
- [x] Dev: Add i18n keys: `confirmDelete`, `confirmRemove`, `areYouSure`
- [x] Verify: Playwright — go to pipeline settings, click delete on a status
- [x] Verify: Playwright — verify dialog appears with red "Delete status" button
- [x] Verify: Playwright — click cancel, verify status still exists
- [x] Verify: Playwright — click delete, verify status removed + toast shown
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 23. Webhooks: Add HMAC signature verification

- [x] Dev: Add `secret` field to WebhookEndpoint model
- [x] Dev: Generate HMAC secret on endpoint creation
- [x] Dev: Verify `X-Webhook-Signature` header using HMAC-SHA256
- [x] Dev: Return 401 for missing/invalid signatures
- [x] Dev: Show secret in webhook management UI (copyable, hidden by default)
- [x] Verify: curl — send request WITHOUT signature, verify 401 response
- [x] Verify: curl — send request WITH correct HMAC signature, verify 200 + customer created
- [x] Verify: curl — send request WITH wrong signature, verify 401
- [x] Verify: Server logs — verify signature validation logs
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 24. Security: Add rate limiting to auth endpoints

- [x] Dev: Install `hono-rate-limiter` or implement simple in-memory rate limiter
- [x] Dev: Apply to `/api/auth/*` routes: 5 requests/minute per IP
- [x] Dev: Return 429 Too Many Requests with Retry-After header
- [x] Verify: curl — send 6 login requests in quick succession
- [x] Verify: Verify first 5 return 200/401, 6th returns 429
- [x] Verify: Server logs — verify rate limit hit logged
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 25. Security: Add consistent role enforcement

- [x] Dev: Create `adminProcedure` extending `tenantProcedure` with role check
- [x] Dev: Apply to: tenant.update, tenant.invite, tenant.removeMember, customerStatus CRUD, customField CRUD
- [x] Dev: Return FORBIDDEN for MEMBER role on admin-only endpoints
- [x] Verify: curl — create a MEMBER user, try to invite a team member, verify 403
- [x] Verify: curl — same MEMBER tries to delete a status, verify 403
- [x] Verify: curl — ADMIN user performs same actions, verify 200
- [x] Verify: Server logs — verify FORBIDDEN errors logged correctly
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 26. Multi-tenancy: Add tenant isolation integration tests

- [x] Dev: Create test file `apps/server/tests/tenant-isolation.test.ts`
- [x] Dev: Test: User A creates customer → User B (different tenant) cannot list it
- [x] Dev: Test: User B cannot update User A's customer
- [x] Dev: Test: User B cannot see User A's conversations, notes, knowledge
- [x] Dev: Test all tRPC procedures that use tenantProcedure
- [x] Verify: Run tests — `cd apps/server && bun run test`
- [x] Verify: All isolation tests pass
- [x] Verify: CI — push and verify tests pass in CI too
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 27. i18n: Fix hardcoded English strings

- [x] Dev: Search codebase for hardcoded English text in TSX files
- [x] Dev: Move "Customer not found", "No activity yet" to i18n
- [x] Dev: Move WhatsApp handoff messages to i18n
- [x] Dev: Add matching Hebrew translations
- [x] Verify: `bun run lint:i18n` — verify no hardcoded strings found
- [x] Verify: Playwright — switch to Hebrew, navigate through pages, verify no English text leaked
- [x] Verify: Playwright — screenshot of customer detail page in Hebrew
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 28. Multi-tenancy: Add tenant switching

- [x] Dev: Add endpoint to list user's tenant memberships
- [x] Dev: Add tenant selector dropdown in sidebar (if user has multiple tenants)
- [x] Dev: Store selected tenant ID in session/localStorage
- [x] Dev: Update tenantProcedure to use selected tenant instead of findFirst
- [x] Verify: Seed a user with 2 tenants
- [x] Verify: Playwright — login, verify tenant selector shows both tenants
- [x] Verify: Playwright — switch tenant, verify dashboard data changes
- [x] Verify: Playwright — verify customer list shows different customers per tenant
- [x] Verify: Server logs — verify tenantId changes in request context
- [x] Fix if needed
- [x] Commit
- [x] CI Check

---

## Phase 2: P1 Important — Significantly Improves Experience (43 tasks)

### 29. Auth: Add onboarding guard

- [x] Dev: Check tenant membership in /dashboard layout route loader
- [x] Dev: If no tenant membership, redirect to /onboarding
- [x] Dev: In /onboarding, check if user already has a tenant, redirect to /dashboard
- [x] Verify: Playwright — register new user, navigate to /dashboard, verify redirect to /onboarding
- [x] Verify: Playwright — user with tenant navigates to /onboarding, verify redirect to /dashboard
- [x] Verify: Server logs — no errors during redirects
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 30. Auth: Add email verification flow

- [x] Dev: Enable Better Auth email verification plugin in server.ts
- [x] Dev: Add "Verify your email" banner on dashboard for unverified users
- [x] Dev: Add "Resend verification" button
- [x] Dev: Add i18n keys: `verifyEmail`, `resendVerification`, `emailVerified`
- [x] Verify: Playwright — register, navigate to dashboard, verify banner appears
- [x] Verify: curl — POST to resend verification endpoint, check 200
- [x] Verify: Server logs — no errors in verification flow
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 31. Auth: Add password strength indicator

- [x] Dev: Create `<PasswordStrength>` component with checklist items
- [x] Dev: Items: 8+ characters, contains number, contains uppercase, contains special char
- [x] Dev: Green checkmark when met, red X when not, update in real-time as user types
- [x] Dev: Add below password fields on register page
- [x] Verify: Playwright — type "abc", verify all red. Type "Abc12345!", verify all green
- [x] Verify: Playwright — screenshot showing mixed state
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 32. Auth: Add password visibility toggle

- [x] Dev: Create eye/eye-off icon button inside password input
- [x] Dev: Toggle input type between "password" and "text"
- [x] Dev: Apply to login and register password fields
- [x] Verify: Playwright — fill password, click eye icon, verify text visible
- [x] Verify: Playwright — click again, verify text hidden
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 33. Auth: Add inline validation

- [x] Dev: Validate email format on blur, show "Invalid email" if wrong
- [x] Dev: Validate password length on blur
- [x] Dev: Add `aria-describedby` linking error message to field
- [x] Dev: Add `aria-invalid="true"` when field has error
- [x] Verify: Playwright — fill "notanemail", blur, verify error message shown
- [x] Verify: Playwright — fill valid email, blur, verify error clears
- [x] Verify: Playwright — screenshot showing inline error
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 34. Auth: Add onboarding checklist

- [x] Dev: Create OnboardingChecklist model or JSON field on Tenant
- [x] Dev: Track: addedCustomer, setupWhatsApp, addedKBEntry, invitedMember
- [x] Dev: Show checklist card on dashboard with checkmarks
- [x] Dev: Auto-update when corresponding actions are completed
- [x] Dev: Add i18n keys for checklist items
- [x] Verify: Playwright — new org dashboard shows checklist with all unchecked
- [x] Verify: Playwright — add a customer, refresh dashboard, verify "Add customer" checked
- [x] Verify: Server logs — no errors in checklist tracking
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 35. Dashboard: Add conversion rate metric

- [x] Dev: Add `getConversionRate` query — count Won / (Won + Lost)
- [x] Dev: Add stat card showing percentage (e.g., "45.2%")
- [x] Dev: Handle edge case: 0 won + 0 lost = show "N/A"
- [x] Dev: Add i18n key: `conversionRate`
- [x] Verify: Seed 3 Won + 2 Lost customers
- [x] Verify: Playwright — verify stat card shows "60%"
- [x] Verify: Playwright — new org shows "N/A" not "NaN"
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 36. Dashboard: Add date range filter

- [x] Dev: Add dropdown above stats: Today, This Week, This Month, All Time
- [x] Dev: Pass date range to getStats and getFunnel queries
- [x] Dev: Filter by createdAt >= rangeStart
- [x] Dev: Add i18n keys: `today`, `thisWeek`, `thisMonth`, `allTime`
- [x] Verify: Seed customers across different dates
- [x] Verify: Playwright — select "Today", verify stats show only today's customers
- [x] Verify: Playwright — select "All Time", verify full count
- [x] Verify: Playwright — screenshot showing filter dropdown
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 37. Dashboard: Add time-series chart

- [x] Dev: Install recharts library
- [x] Dev: Add `getCustomerTimeSeries` query returning daily counts for last 30 days
- [x] Dev: Render LineChart component below stat cards
- [x] Dev: Add i18n key: `newCustomersOverTime`
- [x] Verify: Seed 50 customers across last 30 days
- [x] Verify: Playwright — verify line chart renders with data points
- [x] Verify: Playwright — screenshot of chart
- [x] Verify: Console — no React rendering errors
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 38. Dashboard: Add bot vs human ratio chart

- [x] Dev: Add `getBotHumanRatio` query counting messages by sender type
- [x] Dev: Render PieChart/DonutChart showing BOT vs HUMAN percentages
- [x] Dev: Add i18n keys: `botResponses`, `humanResponses`
- [x] Verify: Seed BOT and HUMAN messages
- [x] Verify: Playwright — verify pie chart renders with correct proportions
- [x] Verify: Playwright — screenshot of chart
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 39. Dashboard: Fix funnel N+1 query

- [x] Dev: Replace N separate `prisma.customer.count` calls with single `prisma.customer.groupBy`
- [x] Dev: Group by statusId, join with status names/colors
- [x] Dev: Verify same data returned as before
- [x] Verify: Server logs — verify only 2 queries (statuses + groupBy) instead of N+1
- [x] Verify: Playwright — verify funnel chart shows same data as before
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 40. Dashboard: Add number formatting + empty state

- [x] Dev: Create `formatNumber()` utility using `Intl.NumberFormat`
- [x] Dev: Apply to all stat card values
- [x] Dev: Create `<DashboardEmptyState>` component for new orgs
- [x] Dev: Show when all stats are 0: welcome message + action buttons
- [x] Dev: Add i18n keys: `welcomeNewOrg`, `getStarted`
- [x] Verify: Seed 1500 customers
- [x] Verify: Playwright — verify stat card shows "1,500" not "1500"
- [x] Verify: Playwright — new org (no data) shows empty state with action buttons
- [x] Verify: Playwright — screenshot of empty state
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 41. Kanban: Add drag visual feedback

- [x] Dev: Install dnd-kit library for proper drag-and-drop
- [x] Dev: Show semi-transparent placeholder in source column
- [x] Dev: Highlight drop target column with border/background change
- [x] Dev: Add optimistic update — move card in UI immediately, revert on error
- [x] Verify: Playwright — drag a card, take screenshot during drag
- [x] Verify: Playwright — drop card, verify it moved to new column
- [x] Verify: Playwright — verify no full-page flicker (optimistic update)
- [x] Verify: Server logs — verify changeStatus mutation succeeded
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 42. Kanban: Add search/filter + card info

- [x] Dev: Add search input above kanban board
- [x] Dev: Filter cards by name/phone as user types (client-side for kanban)
- [x] Dev: Show email and assigned user avatar/initials on each card
- [x] Dev: Add i18n key: `filterCustomers`
- [x] Verify: Playwright — type customer name in filter, verify only matching cards shown
- [x] Verify: Playwright — clear filter, verify all cards return
- [x] Verify: Playwright — verify card shows email and assigned user info
- [x] Verify: Playwright — screenshot of enriched card
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 43. Table: Add row selection + bulk actions

- [x] Dev: Add checkbox column as first column in table
- [x] Dev: Add "Select all" checkbox in header
- [x] Dev: When rows selected, show floating action bar at bottom
- [x] Dev: Action bar buttons: "Change Status", "Assign To", "Delete"
- [x] Dev: Implement bulk status change calling customer.bulkUpdate
- [x] Verify: Playwright — check 3 customer rows, verify action bar appears
- [x] Verify: Playwright — click "Change Status", select new status, verify all 3 updated
- [x] Verify: curl — GET customers, verify statuses changed in DB
- [x] Verify: Playwright — screenshot of action bar
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 44. Table: Add sticky header + search debounce

- [x] Dev: Add `position: sticky; top: 0; z-index: 10` to thead
- [x] Dev: Add 300ms debounce to search input using setTimeout/useRef
- [x] Dev: Add status filter dropdown next to search
- [x] Verify: Seed 50+ customers
- [x] Verify: Playwright — scroll down, verify header stays visible
- [x] Verify: Playwright — type fast in search, verify only 1 API call after 300ms pause
- [x] Verify: Playwright — filter by status, verify table shows only matching
- [x] Verify: Server logs — verify debounced requests (not one per keystroke)
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 45. Table: Add column visibility toggle + assigned user column

- [x] Dev: Add "Columns" dropdown button in table header area
- [x] Dev: Checkbox per column to show/hide
- [x] Dev: Persist column visibility in localStorage
- [x] Dev: Add "Assigned To" column showing user name
- [x] Verify: Playwright — click Columns dropdown, uncheck "Email", verify column hidden
- [x] Verify: Playwright — refresh page, verify column stays hidden (localStorage)
- [x] Verify: Playwright — verify Assigned To column shows user names
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 46. Customer Detail: Add unified timeline

- [x] Dev: Create unified query merging activities + notes + messages by date
- [x] Dev: Render single chronological feed with type-specific styling
- [x] Dev: Resolve actorId/authorId to user names (join with User table)
- [x] Dev: Show "John Doe changed status from X to Y" instead of "Status changed"
- [x] Verify: Seed customer with activity + note + message
- [x] Verify: Playwright — verify all 3 types appear in one timeline
- [x] Verify: Playwright — verify chronological order (newest first or oldest first)
- [x] Verify: Playwright — verify user names shown, not IDs
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 47. Customer Detail: Add breadcrumb + delete

- [x] Dev: Create `<Breadcrumb>` component: Dashboard > Customers > {name}
- [x] Dev: Each segment is a clickable link
- [x] Dev: Add "Delete" button in customer detail header
- [x] Dev: Use `<ConfirmDialog>` from task #22 before deleting
- [x] Dev: After delete, redirect to /dashboard/customers
- [x] Verify: Playwright — navigate to customer detail, verify breadcrumb shows correct path
- [x] Verify: Playwright — click "Customers" in breadcrumb, verify navigates to list
- [x] Verify: Playwright — click Delete, confirm, verify redirected to customer list
- [x] Verify: curl — GET deleted customer, verify 404
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 48. Timeline: Add type-specific icons + relative timestamps

- [x] Dev: Install date-fns
- [x] Dev: Use `formatDistanceToNow` for timestamps ("5 minutes ago")
- [x] Dev: Show absolute timestamp on hover (tooltip)
- [x] Dev: Add icons per activity type using Lucide icons
- [x] Dev: Color code: blue=status, yellow=note, purple=assignment, green=created, teal=message
- [x] Verify: Playwright — verify different icons for status change vs note
- [x] Verify: Playwright — verify "5 minutes ago" text (not "2026-04-18T...")
- [x] Verify: Playwright — hover timestamp, verify tooltip shows absolute date
- [x] Verify: Playwright — screenshot of colored timeline
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 49. Timeline: Add activity type filter

- [x] Dev: Add filter chips above timeline: All, Status Changes, Notes, Messages
- [x] Dev: Filter activities client-side based on selected type
- [x] Dev: Highlight active filter chip
- [x] Verify: Playwright — click "Notes", verify only notes shown
- [x] Verify: Playwright — click "Status Changes", verify only status changes shown
- [x] Verify: Playwright — click "All", verify all items return
- [x] Verify: Playwright — screenshot of filtered timeline
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 50. Chat: Add textarea + scroll-to-bottom + message grouping

- [x] Dev: Replace single-line `<input>` with auto-resize `<textarea>`
- [x] Dev: Shift+Enter inserts newline, Enter sends message
- [x] Dev: Auto-resize textarea up to 4 lines
- [x] Dev: Group consecutive messages from same sender within 1 minute
- [x] Dev: Add auto-scroll to bottom on new messages
- [x] Dev: Add "New messages ↓" button when user has scrolled up
- [x] Verify: Playwright — type multi-line message with Shift+Enter, verify newline works
- [x] Verify: Playwright — press Enter, verify message sent
- [x] Verify: Playwright — verify consecutive messages grouped (shared bubble)
- [x] Verify: Playwright — send message, verify auto-scrolled to bottom
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 51. Chat: Add last message preview + conversation search

- [x] Dev: Include last message text in conversation.list query
- [x] Dev: Show truncated last message (50 chars) under customer name in list
- [x] Dev: Show relative timestamp of last message
- [x] Dev: Add search input above conversation list
- [x] Dev: Filter conversations by customer name
- [x] Verify: Playwright — verify conversation list shows message previews
- [x] Verify: Playwright — type customer name in search, verify filtered
- [x] Verify: Playwright — clear search, verify all conversations return
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 52. Chat: Add canned responses

- [x] Dev: Create CannedResponse model (tenantId, shortcut, body)
- [x] Dev: Add canned response management in Settings
- [x] Dev: In chat input, detect "/" at start, show dropdown of responses
- [x] Dev: Select response to insert its body into the textarea
- [x] Verify: Playwright — go to settings, create canned response "/hello" = "Hello! How can I help?"
- [x] Verify: Playwright — go to chat, type "/", verify dropdown shows
- [x] Verify: Playwright — select "/hello", verify text inserted in textarea
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 53. Bot: Add conversation summary on handoff

- [x] Dev: When bot hands off, generate 2-3 sentence summary via OpenAI
- [x] Dev: Store summary in Conversation model (handoffSummary field)
- [x] Dev: Show summary banner at top of chat when agent opens handoff conversation
- [x] Dev: Add i18n key: `handoffSummary`
- [x] Verify: curl — trigger a handoff scenario
- [x] Verify: Server logs — verify OpenAI summary call made
- [x] Verify: Playwright — open the handed-off conversation, verify summary banner shown
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 54. Bot: Add customizable system prompt

- [x] Dev: Add `botSystemPrompt` text field to Tenant model
- [x] Dev: Add textarea in Settings → WhatsApp section for editing prompt
- [x] Dev: Use tenant.botSystemPrompt in whatsapp-webhook.ts (fallback to default)
- [x] Verify: Playwright — go to settings, edit system prompt, save
- [x] Verify: curl — trigger bot, check server logs for custom prompt being used
- [x] Verify: Playwright — verify toast confirmation on save
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 55. Bot: Add OpenAI error handling

- [x] Dev: Wrap all OpenAI calls in try/catch in whatsapp-webhook.ts
- [x] Dev: On error: hand off to human, send tenant-language error message
- [x] Dev: Log error with context (conversationId, customerId)
- [x] Verify: Temporarily set invalid OPENAI_API_KEY
- [x] Verify: curl — send WhatsApp webhook triggering bot
- [x] Verify: Server logs — verify error caught gracefully, no crash
- [x] Verify: curl — check conversation.isBot = false (handed off)
- [x] Verify: Restore valid API key
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 56. Knowledge: Add test query tool

- [x] Dev: Add "Test a question" section on knowledge base page
- [x] Dev: Input field + "Ask" button
- [x] Dev: Create tRPC procedure that runs RAG pipeline and returns: chunks, scores, answer
- [x] Dev: Display results: retrieved chunks with scores, generated answer
- [x] Verify: Seed a knowledge entry
- [x] Verify: Playwright — type a related question, click Ask
- [x] Verify: Playwright — verify chunks displayed with confidence scores
- [x] Verify: Playwright — verify generated answer shown
- [x] Verify: Server logs — verify RAG pipeline executed
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 57. Knowledge: Add async embedding + error handling

- [x] Dev: Add `status` field to KnowledgeEntry: "processing" | "ready" | "failed"
- [x] Dev: Return entry immediately with status="processing"
- [x] Dev: Run embed pipeline in background (setTimeout or queue)
- [x] Dev: Update status to "ready" on success, "failed" on error
- [x] Dev: Show status badge on entry cards in UI
- [x] Dev: Add "Retry" button for failed entries
- [x] Verify: Playwright — create text entry, verify "processing" status shown
- [x] Verify: Playwright — wait 5-10 seconds, refresh, verify "ready" status
- [x] Verify: Server logs — verify background pipeline completed
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 58. Automation: Add execution history + test run

- [x] Dev: Create execution history view on flow detail page
- [x] Dev: Show list: timestamp, customer name, status (success/failed), step details
- [x] Dev: Add "Test Run" button that executes flow in dry-run mode (no actual messages sent)
- [x] Dev: Show test results inline: each step's pass/fail status
- [x] Verify: Trigger an automation flow
- [x] Verify: Playwright — open flow detail, verify execution log appears
- [x] Verify: Playwright — click "Test Run", select a customer, verify results shown
- [x] Verify: Server logs — verify dry-run didn't send real messages
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 59. Automation: Add retry logic + drag-to-reorder

- [x] Dev: Add retryCount config per step (default 1, max 3)
- [x] Dev: On step failure, retry with exponential backoff (1s, 2s, 4s)
- [x] Dev: Log each retry attempt in AutomationLog
- [x] Dev: Add drag handles to step cards in flow editor
- [x] Dev: Reorder steps via drag-and-drop, save new order
- [x] Verify: Create a flow with a step that will fail
- [x] Verify: Server logs — verify retry attempts logged
- [x] Verify: Playwright — drag step 2 above step 1, save, verify order changed
- [x] Verify: Playwright — reload page, verify new order persisted
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 60. Webhooks: Add request logging + test button

- [x] Dev: Create WebhookLog model (endpointId, timestamp, status, payload, response)
- [x] Dev: Log every incoming request in webhook-ingestion.ts
- [x] Dev: Show last 20 logs per endpoint in UI
- [x] Dev: Add "Send Test" button that POSTs a sample payload to the endpoint
- [x] Dev: Show test result (success/failure + response body)
- [x] Verify: curl — send a webhook request
- [x] Verify: Playwright — open webhook detail, verify request log appears
- [x] Verify: Playwright — click "Send Test", verify result shown
- [x] Verify: Server logs — verify logging works
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 61. Webhooks: Add visual field mapping editor

- [x] Dev: Replace raw JSON field mapping with dropdown-based UI
- [x] Dev: Left column: external field name (text input)
- [x] Dev: Right column: dropdown of Customer fields (name, email, phone, + custom fields)
- [x] Dev: Add/remove mapping rows with + / - buttons
- [x] Dev: Save as JSON to the existing fieldMapping field
- [x] Verify: Playwright — add mapping "full_name" → "name", save
- [x] Verify: curl — send webhook with `{"full_name": "Test"}`, verify customer created with name "Test"
- [x] Verify: Playwright — screenshot of field mapping editor
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 62. Settings: Add sub-navigation + invite-by-link

- [x] Dev: Add tab bar at top of settings pages: General, Team, Pipeline, Custom Fields
- [x] Dev: Highlight active tab based on current route
- [x] Dev: Add "Generate Invite Link" button on team page
- [x] Dev: Create invite link with token and expiry (7 days)
- [x] Dev: Show copyable invite URL
- [x] Verify: Playwright — navigate to /dashboard/settings, verify tabs shown
- [x] Verify: Playwright — click "Team" tab, verify team page loads
- [x] Verify: Playwright — click "Generate Invite Link", verify URL shown
- [x] Verify: Playwright — copy URL, verify it's a valid link format
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 63. Settings: Add drag-to-reorder + inline editing

- [x] Dev: Add drag handles to pipeline status items
- [x] Dev: Reorder via drag-and-drop, call customerStatus.reorder on drop
- [x] Dev: Click status name to edit inline, save on blur
- [x] Dev: Click color swatch to change color, save immediately
- [x] Dev: Add options editor for SELECT/MULTI_SELECT custom fields
- [x] Verify: Playwright — drag "Contacted" above "New", verify new order saved
- [x] Verify: Playwright — click status name, type new name, blur, verify saved
- [x] Verify: Playwright — reload page, verify order and name persisted
- [x] Verify: Server logs — verify reorder mutation succeeded
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 64. Search: Add Cmd+K + debounce + keyboard navigation

- [x] Dev: Add global keydown listener for Cmd/Ctrl+K
- [x] Dev: Focus search input (or open command palette modal)
- [x] Dev: Add 300ms debounce using setTimeout/useRef
- [x] Dev: Track highlighted result index with arrow keys
- [x] Dev: Enter navigates to highlighted result, Escape closes
- [x] Verify: Playwright — press Ctrl+K, verify search focused
- [x] Verify: Playwright — type query, wait 300ms, verify single API call
- [x] Verify: Playwright — press ArrowDown twice, press Enter, verify navigation
- [x] Verify: Playwright — press Escape, verify search closes
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 65. Navigation: Add breadcrumbs + unread badge

- [x] Dev: Create `<Breadcrumb>` component using route path segments
- [x] Dev: Add to all dashboard pages: Dashboard > Module > Detail
- [x] Dev: Add unread message count query
- [x] Dev: Show red badge with count on "Conversations" nav item
- [x] Verify: Playwright — navigate to /dashboard/customers/123, verify breadcrumb "Dashboard > Customers > Customer Name"
- [x] Verify: Playwright — seed unread messages, verify badge shows count
- [x] Verify: Playwright — read all messages, verify badge disappears
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 66. Navigation: Add user info in sidebar + Link components

- [x] Dev: Fetch current user name in dashboard layout
- [x] Dev: Show user name/initials avatar above "Sign Out" in sidebar
- [x] Dev: Replace all `<a>` + `navigate()` with proper `<Link>` components
- [x] Dev: Fix all `as '/'` type casts with proper route typing
- [x] Verify: Playwright — verify user name shown in sidebar bottom
- [x] Verify: Playwright — click each nav link, verify navigation works without full page reload
- [x] Verify: Console — verify no type errors or navigation warnings
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 67. i18n: Format dates and numbers with locale

- [x] Dev: Create `formatDate()` utility using `Intl.DateTimeFormat` with tenant locale
- [x] Dev: Create `formatNumber()` utility using `Intl.NumberFormat`
- [x] Dev: Replace all `toLocaleDateString()` / `toLocaleString()` calls
- [x] Dev: Replace all raw number displays with `formatNumber()`
- [x] Verify: Playwright — set tenant language to "he", navigate to dashboard
- [x] Verify: Playwright — verify dates show in Hebrew format
- [x] Verify: Playwright — verify numbers show with proper formatting
- [x] Verify: Playwright — screenshot of Hebrew-formatted page
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 68. i18n: Test RTL layout thoroughly

- [x] Dev: Set language to Hebrew, navigate through every page
- [x] Dev: Fix sidebar direction (should be on the right in RTL)
- [x] Dev: Fix kanban scroll direction
- [x] Dev: Fix chat bubbles (outbound should be on the left in RTL)
- [x] Dev: Fix table text alignment
- [x] Dev: Fix any `translate-x` that doesn't respect RTL
- [x] Verify: Playwright — set lang=he, take screenshot of dashboard
- [x] Verify: Playwright — take screenshot of customers kanban in RTL
- [x] Verify: Playwright — take screenshot of conversations in RTL
- [x] Verify: Playwright — take screenshot of settings in RTL
- [x] Verify: Verify all screenshots show correct RTL layout
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 69. Security: Add rate limiting to tRPC + webhooks

- [x] Dev: Add rate limiting middleware to Hono for `/trpc/*` routes
- [x] Dev: Limit: 100 requests/minute per authenticated user
- [x] Dev: Add rate limiting to webhook ingestion: 60 req/min per token
- [x] Dev: Return 429 Too Many Requests with Retry-After header
- [x] Verify: curl — send 101 tRPC requests rapidly, verify 101st returns 429
- [x] Verify: curl — send 61 webhook requests, verify 61st returns 429
- [x] Verify: Server logs — verify rate limit events logged
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 70. Security: Encrypt sensitive DB fields

- [x] Dev: Create encrypt/decrypt utility using Node crypto (AES-256-GCM)
- [x] Dev: Encrypt `greenApiToken` before saving to DB
- [x] Dev: Decrypt when reading for WhatsApp API calls
- [x] Dev: Store encryption key in env var `ENCRYPTION_KEY`
- [x] Verify: Save a WhatsApp token in settings
- [x] Verify: Query DB directly (mongosh), verify token is encrypted (not plain text)
- [x] Verify: Verify WhatsApp API calls still work with decrypted token
- [x] Verify: Server logs — no errors in encrypt/decrypt flow
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 71. Mobile: Fix chat layout + kanban swipe

- [x] Dev: At <768px, conversation list takes full width
- [x] Dev: Tapping conversation navigates to full-screen chat view
- [x] Dev: Add "Back" button in chat header to return to list
- [x] Dev: At <768px, kanban shows one column at a time with swipe
- [x] Dev: Add left/right swipe or arrow buttons to navigate columns
- [x] Verify: Playwright — resize to 375px width
- [x] Verify: Playwright — navigate to conversations, verify full-width list
- [x] Verify: Playwright — tap conversation, verify full-screen chat
- [x] Verify: Playwright — navigate to customers kanban, verify single column view
- [x] Verify: Playwright — screenshot of mobile chat
- [x] Verify: Playwright — screenshot of mobile kanban
- [x] Fix if needed
- [x] Commit
- [x] CI Check

---

## Phase 3: P2 Nice-to-Have (selected high-impact items, 20 tasks)

### 72. Auth: Add Google OAuth login

- [x] Dev: Enable Better Auth Google provider in server.ts
- [x] Dev: Add Google client ID/secret to env
- [x] Dev: Add "Continue with Google" button on login/register pages
- [x] Verify: Playwright — verify Google button shows on login page
- [x] Verify: Click Google button, verify OAuth flow starts
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 73. Dashboard: Add recent activity feed

- [x] Dev: Query last 10 activities across all customers
- [x] Dev: Show as timeline card on dashboard below charts
- [x] Dev: Each item links to the relevant customer
- [x] Verify: Playwright — seed activities, verify feed shows on dashboard
- [x] Verify: Playwright — click activity, verify navigates to customer
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 74. Dashboard: Add clickable stat cards

- [x] Dev: Wrap stat cards in clickable links
- [x] Dev: "Total Customers" → /dashboard/customers
- [x] Dev: "Active Conversations" → /dashboard/conversations
- [x] Verify: Playwright — click "Total Customers" card, verify navigates to customers page
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 75. Kanban: Add column collapse + WIP limits

- [x] Dev: Click column header to collapse to header-only (saves space)
- [x] Dev: Add optional WIP limit per status in settings
- [x] Dev: Show warning color when column exceeds limit
- [x] Verify: Playwright — collapse a column, verify it minimizes
- [x] Verify: Playwright — set WIP limit to 3, add 4th card, verify warning
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 76. Table: Add CSV export

- [x] Dev: Add "Export CSV" button in table header
- [x] Dev: Export current filtered view as CSV file
- [x] Dev: Include all visible columns
- [x] Verify: Playwright — click Export, verify file downloaded
- [x] Verify: Open CSV, verify correct data and columns
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 77. Table: Add saved views

- [x] Dev: Create SavedView model (tenantId, name, filters, columns, sort)
- [x] Dev: Add "Save View" button and view tabs above table
- [x] Dev: Load saved view on tab click
- [x] Verify: Playwright — configure filters, save as "Hot Leads", verify tab appears
- [x] Verify: Playwright — click tab, verify filters restored
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 78. Customer Detail: Add tabbed layout

- [x] Dev: Add tab bar: Overview, Activity, Conversations, Notes
- [x] Dev: Show relevant content per tab
- [x] Dev: Remember last active tab in localStorage
- [x] Verify: Playwright — switch between tabs, verify content changes
- [x] Verify: Playwright — refresh, verify last tab remembered
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 79. Timeline: Add rich text notes + @mentions

- [x] Dev: Add markdown rendering for note body (bold, italic, lists)
- [x] Dev: Add `@` trigger to mention team members
- [x] Dev: Notify mentioned users
- [x] Verify: Playwright — create note with **bold** text, verify rendered as bold
- [x] Verify: Playwright — type `@`, verify member dropdown, select, verify mention
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 80. Chat: Add emoji picker + typing indicator

- [x] Dev: Add emoji picker button next to send button
- [x] Dev: Insert selected emoji into textarea
- [x] Dev: Show "Customer is typing..." when green-api reports typing
- [x] Verify: Playwright — click emoji button, select emoji, verify inserted
- [x] Verify: Playwright — verify typing indicator area exists
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 81. Chat: Add media message support

- [x] Dev: Display image/file messages from WhatsApp (media URLs)
- [x] Dev: Add file upload button in chat input
- [x] Dev: Send media via green-api sendFileByUrl
- [x] Verify: Playwright — receive image message, verify image renders in chat
- [x] Verify: Playwright — upload and send an image, verify sent
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 82. Bot: Add bot analytics dashboard

- [x] Dev: Track metrics: bot response count, handoff count, avg confidence
- [x] Dev: Create analytics section in dashboard or settings
- [x] Dev: Show charts: response rate over time, top questions
- [x] Verify: Seed bot interactions
- [x] Verify: Playwright — navigate to bot analytics, verify charts render
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 83. Bot: Add sentiment-based escalation

- [x] Dev: Analyze customer message sentiment using OpenAI
- [x] Dev: If negative sentiment detected 2+ times, auto-escalate
- [x] Dev: Log sentiment score per message
- [x] Verify: curl — send angry messages, verify escalation triggered
- [x] Verify: Server logs — verify sentiment analysis ran
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 84. Knowledge: Add chunk preview + usage analytics

- [x] Dev: Show expandable chunk list on each entry detail view
- [x] Dev: Track chunk retrieval counts in Qdrant metadata
- [x] Dev: Show "Used 15 times this week" on entry cards
- [x] Verify: Playwright — expand entry, verify chunks displayed
- [x] Verify: Playwright — verify usage count shown
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 85. Automation: Add flow templates

- [x] Dev: Create template list: Welcome, Follow-up, Re-engage, Win-back
- [x] Dev: "Create from template" button on automations page
- [x] Dev: Pre-fill trigger + steps from template
- [x] Verify: Playwright — click "Create from template", select "Welcome"
- [x] Verify: Playwright — verify flow pre-filled with welcome steps
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 86. Automation: Add visual flow diagram

- [x] Dev: Render read-only vertical node graph of flow
- [x] Dev: Show trigger at top, steps as connected nodes
- [x] Dev: Color-code by step type
- [x] Verify: Playwright — view flow with 3 steps, verify diagram renders
- [x] Verify: Playwright — screenshot of visual flow
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 87. Settings: Add "Danger Zone" + org deletion

- [x] Dev: Add red "Danger Zone" section at bottom of tenant settings
- [x] Dev: "Delete Organization" button with double confirmation (type org name)
- [x] Dev: Delete all tenant data cascade
- [x] Dev: Redirect to / after deletion
- [x] Verify: Playwright — scroll to danger zone, click Delete
- [x] Verify: Playwright — type wrong name, verify button stays disabled
- [x] Verify: Playwright — type correct name, delete, verify redirected
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 88. Search: Convert to Cmd+K command palette

- [x] Dev: Replace inline search bar with modal command palette
- [x] Dev: Support commands: search, navigate, create customer
- [x] Dev: Show recent commands
- [x] Verify: Playwright — Cmd+K opens modal, type "cust", verify results
- [x] Verify: Playwright — Escape closes modal
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 89. Navigation: Add collapsible sidebar + notifications

- [x] Dev: Add collapse button to minimize sidebar to icons only (56px)
- [x] Dev: Persist collapsed state in localStorage
- [x] Dev: Add notification bell icon in header
- [x] Dev: Notification dropdown: new messages, handoffs, invites
- [x] Verify: Playwright — click collapse, verify sidebar shrinks to icons
- [x] Verify: Playwright — click bell, verify notification dropdown
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 90. Cross-cutting: Add dark mode

- [x] Dev: Add dark mode toggle in header (sun/moon icon)
- [x] Dev: Use Tailwind `dark:` class variants
- [x] Dev: Persist preference in localStorage
- [x] Dev: Respect system preference as default
- [x] Verify: Playwright — click dark mode toggle, verify colors change
- [x] Verify: Playwright — screenshot of dark mode dashboard
- [x] Verify: Playwright — refresh, verify dark mode persisted
- [x] Fix if needed
- [x] Commit
- [x] CI Check

### 91. Cross-cutting: Add keyboard shortcuts

- [x] Dev: Add global keyboard listener for shortcuts
- [x] Dev: `n` = new customer modal, Cmd+K = search, `?` = show shortcuts help
- [x] Dev: Create shortcuts help dialog showing all available shortcuts
- [x] Verify: Playwright — press `n`, verify new customer modal opens
- [x] Verify: Playwright — press `?`, verify help dialog shows
- [x] Fix if needed
- [x] Commit
- [x] CI Check
