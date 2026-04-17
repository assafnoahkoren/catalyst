# Catalyst CRM — Design Document

**Date:** 2026-04-18
**Status:** Approved

## Overview

Multi-tenant CRM SaaS with AI-powered WhatsApp automation, built on the Catalyst monorepo. Manages customers, conversations, knowledge bases, and automated messaging flows.

## Stack Additions

| Concern   | Technology                            |
| --------- | ------------------------------------- |
| LLM       | OpenAI GPT-4 + text-embedding-3-small |
| Vector DB | Qdrant (Docker local, hosted prod)    |
| WhatsApp  | green-api.com                         |
| Real-time | Server-Sent Events (SSE) via Hono     |

## Multi-Tenancy

Every data model includes a `tenantId` field. All queries are scoped by tenant via Prisma middleware. Tenant isolation is enforced at the tRPC middleware level — `ctx.tenantId` is injected from the user's active membership.

## Data Models

### Tenant

```
Tenant
  ├── id, name, slug, plan, language, createdAt
  ├── settings (JSON: timezone, confidenceThreshold, handoffKeywords)
  └── greenApiInstance, greenApiToken
```

`language` affects: bot response language, default customer statuses, handoff keywords, automation templates.

### TenantMember

```
TenantMember
  ├── userId → User
  ├── tenantId → Tenant
  ├── role: OWNER | ADMIN | MEMBER
  └── invitedAt, joinedAt
```

Fixed roles in v1. Designed for custom roles with granular permissions in v2.

### Customer

```
Customer
  ├── id, tenantId
  ├── name, email, phone
  ├── statusId → CustomerStatus
  ├── source: WEBHOOK | MANUAL | FACEBOOK | IMPORT
  ├── assignedToId → User
  ├── customFields (JSON — structured by CustomFieldDefinition)
  ├── tags: String[]
  └── createdAt, updatedAt
```

### CustomerStatus

```
CustomerStatus
  ├── id, tenantId
  ├── name, color, order
  ├── isDefault, isClosed (won/lost)
  └── autoMessage (template triggered on status change)
```

Seeded per new tenant in tenant's language. Defaults: New → Contacted → Qualified → Proposal → Won → Lost.

### CustomFieldDefinition

```
CustomFieldDefinition
  ├── id, tenantId
  ├── name (display label)
  ├── key (slug, auto-generated)
  ├── type: TEXT | NUMBER | DATE | SELECT | MULTI_SELECT | BOOLEAN | URL | PHONE
  ├── options: String[] (for SELECT/MULTI_SELECT)
  ├── isRequired: boolean
  ├── order: number
  └── createdAt
```

Custom fields appear in: customer detail panel, table view columns, webhook field mapping, automation conditions, message templates (`{{customer.custom.budget}}`).

### Conversation

```
Conversation
  ├── id, tenantId
  ├── customerId → Customer
  ├── channel: WHATSAPP
  ├── isBot: boolean (bot active or handed to human)
  └── assignedToId → User
```

### Message

```
Message
  ├── id, conversationId
  ├── direction: INBOUND | OUTBOUND
  ├── sender: BOT | HUMAN | CUSTOMER
  ├── body, mediaUrl
  └── sentAt
```

### KnowledgeEntry

```
KnowledgeEntry
  ├── id, tenantId
  ├── type: TEXT | FILE | URL | QA_PAIR
  ├── title, content (raw text)
  ├── fileUrl (for uploads)
  ├── sourceUrl (for scraped pages)
  ├── question, answer (for Q&A pairs)
  ├── chunkCount (number of vectors stored)
  └── createdAt
```

### AutomationFlow

```
AutomationFlow
  ├── id, tenantId
  ├── name, isActive
  ├── trigger: { type, config } (JSON)
  └── steps: [{ action, config, delayMs }] (JSON array)
```

### AutomationLog

```
AutomationLog
  ├── id, flowId, customerId
  ├── stepIndex, status: SUCCESS | FAILED | PENDING
  └── executedAt, result (JSON)
```

### WebhookEndpoint

```
WebhookEndpoint
  ├── id, tenantId
  ├── token (unique, for URL: /api/webhook/<token>)
  ├── fieldMapping (JSON: maps external fields to Customer fields)
  └── isActive
```

### Activity

```
Activity
  ├── id, tenantId, customerId
  ├── type: STATUS_CHANGE | MESSAGE | NOTE | ASSIGNMENT | CREATED | CUSTOM_FIELD_CHANGE
  ├── actorId → User (null for bot/system)
  ├── data (JSON)
  └── createdAt
```

Auto-generated on every customer mutation via middleware.

### Note

```
Note
  ├── id, tenantId, customerId
  ├── authorId → User
  ├── body (text)
  └── createdAt, updatedAt
```

Team-internal only. Adding a note creates an Activity of type NOTE.

## Package Architecture

### New Packages

```
packages/
  ├── ai/                # OpenAI client wrapper
  │   ├── embeddings.ts    # text-embedding-3-small, batch embed
  │   ├── chat.ts          # GPT-4 chat with RAG context
  │   └── index.ts
  │
  ├── knowledge/         # Knowledge base + vector search
  │   ├── parser.ts        # Parse PDF, DOCX, TXT, URLs
  │   ├── chunker.ts       # Split text into ~500 token chunks
  │   ├── vectorStore.ts   # Qdrant client, upsert/search
  │   ├── rag.ts           # Full RAG pipeline
  │   └── index.ts
  │
  ├── whatsapp/          # green-api.com integration
  │   ├── client.ts        # REST client (send message, read status)
  │   ├── webhook.ts       # Parse incoming webhook payloads
  │   ├── types.ts         # Message types
  │   └── index.ts
  │
  ├── automation/        # Trigger & flow engine
  │   ├── triggers.ts      # Evaluate trigger conditions
  │   ├── actions.ts       # Execute actions
  │   ├── engine.ts        # Flow runner
  │   ├── scheduler.ts     # Time-based trigger polling
  │   └── index.ts
  │
  └── webhook/           # Incoming lead webhook handler
      ├── handler.ts       # Validate token, map fields, create customer
      └── index.ts
```

### Dependency Graph

```
@catalyst/web ──→ @catalyst/ui, @catalyst/auth/client, @catalyst/validation, @catalyst/i18n

@catalyst/server ──→ @catalyst/auth/server, @catalyst/db, @catalyst/validation, @catalyst/logger
                 ──→ @catalyst/ai, @catalyst/knowledge, @catalyst/whatsapp
                 ──→ @catalyst/automation, @catalyst/webhook

@catalyst/knowledge ──→ @catalyst/ai
@catalyst/automation ──→ @catalyst/whatsapp, @catalyst/db
@catalyst/webhook ──→ @catalyst/db
```

## Request Flows

### Customer comes in via webhook

```
External POST /api/webhook/<token>
  → @catalyst/webhook (validate token, map fields)
  → @catalyst/db (create Customer)
  → @catalyst/automation (fire NEW_CUSTOMER trigger)
  → @catalyst/whatsapp (send welcome message if configured)
```

### WhatsApp message received

```
green-api webhook → server
  → @catalyst/whatsapp (parse message)
  → @catalyst/db (find/create Conversation)
  → if bot active:
      → check handoff keywords → if match: hand off to human
      → @catalyst/knowledge/rag (embed → search Qdrant → context)
      → @catalyst/ai/chat (GPT-4 with RAG context → reply)
      → if confidence < threshold: hand off to human
      → else: send bot reply via green-api
  → if human mode:
      → push SSE to assigned team member
```

### Knowledge base upload

```
User uploads file
  → @catalyst/knowledge/parser (extract text)
  → @catalyst/knowledge/chunker (split into chunks)
  → @catalyst/ai/embeddings (embed each chunk)
  → @catalyst/knowledge/vectorStore (upsert to Qdrant with tenantId)
  → @catalyst/db (save KnowledgeEntry)
```

### Automation flow execution

```
Trigger fires (status change / time-based / new customer)
  → @catalyst/automation/engine (load flow, evaluate conditions)
  → for each step:
      → WAIT: schedule via scheduler (MongoDB ScheduledTask)
      → SEND_WHATSAPP: send via green-api
      → CHANGE_STATUS: update customer
      → CONDITION: evaluate, stop flow if false
      → log to AutomationLog
```

## WhatsApp Bot & RAG

### Bot Flow

1. Customer sends message via WhatsApp
2. green-api webhook hits `/api/whatsapp/webhook`
3. Find tenant by green-api instance ID
4. Find or create Customer by phone number
5. Find or create Conversation
6. If bot mode:
   - Check handoff keywords ("agent", "human", "נציג" — customizable per tenant)
   - If match: set isBot=false, notify team, send "connecting you..."
   - RAG pipeline: embed message → search Qdrant (top 5, filtered by tenantId)
   - If top similarity score < threshold (default 0.7, configurable): hand off to human
   - If score >= threshold: GPT-4 generates reply with RAG context + conversation history
   - Send reply via green-api, save as Message (sender: BOT)
7. If human mode: save message, push SSE to assigned team member

### RAG Prompt

```
You are a helpful assistant for {tenant.name}.
Answer the customer's question using ONLY the context below.
If the context doesn't contain enough information, say you'll connect them with a team member.
Keep responses concise and friendly. Reply in {tenant.language}.
If the customer writes in a different language, reply in their language instead.

## Context
{top 5 knowledge chunks}

## Conversation History
{last 10 messages}

## Customer Message
{current message}
```

## Automation Engine

### Trigger Types (v1)

| Trigger          | Config                          |
| ---------------- | ------------------------------- |
| STATUS_CHANGE    | `{ fromStatusId?, toStatusId }` |
| NEW_CUSTOMER     | `{ source? }`                   |
| MESSAGE_RECEIVED | `{ isFirstMessage? }`           |
| TIME_BASED       | `{ statusId, delayMs }`         |

### Action Types (v1)

| Action        | Config                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| SEND_WHATSAPP | `{ template }` — supports `{{customer.name}}`, `{{customer.custom.*}}` |
| CHANGE_STATUS | `{ toStatusId }`                                                       |
| ASSIGN_TO     | `{ userId }`                                                           |
| WAIT          | `{ delayMs }`                                                          |
| CONDITION     | `{ field, operator, value }` — if false, stop flow                     |

### Scheduler

- WAIT steps create a ScheduledTask in MongoDB
- Background worker polls every 60 seconds for due tasks
- Resumes flow at next step, logs to AutomationLog
- Recovers pending tasks on server restart

### Designed for branching (v2)

Linear steps array in v1. For v2, steps become a graph: `nodes: [{ id, action, config, nextOnTrue?, nextOnFalse? }]`. Data model change only — engine already evaluates conditions.

## Frontend Pages

```
apps/web/src/routes/
  ├── index.tsx                          # Landing / redirect
  ├── login.tsx                          # (existing)
  ├── register.tsx                       # (existing)
  ├── onboarding.tsx                     # Create tenant after registration
  ├── dashboard/
  │   ├── index.tsx                      # Dashboard (metrics + charts)
  │   ├── customers/
  │   │   ├── index.tsx                  # Kanban + Table toggle
  │   │   └── $customerId.tsx            # Customer detail panel
  │   ├── conversations/
  │   │   ├── index.tsx                  # Conversation list
  │   │   └── $conversationId.tsx        # Chat view
  │   ├── knowledge/
  │   │   ├── index.tsx                  # Knowledge entries list
  │   │   └── new.tsx                    # Upload/create entry
  │   ├── automations/
  │   │   ├── index.tsx                  # Flows list
  │   │   └── $flowId.tsx                # Flow editor
  │   ├── webhooks/
  │   │   └── index.tsx                  # Webhook management
  │   └── settings/
  │       ├── index.tsx                  # Tenant settings
  │       ├── team.tsx                   # Team members
  │       ├── pipeline.tsx               # Customer statuses
  │       └── custom-fields.tsx          # Custom field definitions
```

### Dashboard

- Stats cards: total customers, new today, conversion rate, active conversations
- Customer funnel chart by status
- Messages sent/received over time
- Bot vs human response breakdown
- Average response time

### Customers Page

- Toggle: Kanban / Table view (persisted in localStorage)
- Kanban: columns per CustomerStatus, drag-drop, customer cards
- Table: sortable columns (including custom fields), inline status, bulk actions, search/filter
- Click customer → slide-over with details, activity timeline, notes, conversation

### Conversations Page

- Left sidebar: conversation list sorted by last message
- Right panel: WhatsApp-style chat bubbles
- Bot indicator (green = bot, orange = human)
- "Take over" / "Return to bot" buttons

### Automation Flow Editor

- Trigger selector dropdown
- Linear step list: add steps sequentially
- Step types: send message (template editor with variables), wait, change status, condition
- Enable/disable toggle, test run button

### Knowledge Base Page

- Card grid by type (file/text/url/qa)
- Upload dropzone (PDF, DOCX, TXT)
- Add URL, Add Q&A pair, Add text forms
- Processing status indicator

### Global Search

- Search bar in dashboard header
- MongoDB text index across: customer name, email, phone, notes body, custom field values
- Results grouped by type, debounced, top 10 with highlighting

## Infrastructure

### Docker Compose (updated)

```yaml
services:
  mongodb:
    image: mongo:7
    command: ["--replSet", "rs0"]
    ports: ["27018:27017"]
    volumes: [mongo-data:/data/db]

  mongo-init:
    image: mongo:7
    depends_on: [mongodb]
    command: mongosh --host mongodb --eval "rs.initiate()"
    restart: "no"

  qdrant:
    image: qdrant/qdrant:latest
    ports: ["6333:6333"]
    volumes: [qdrant-data:/qdrant/storage]
```

### New Environment Variables

```env
OPENAI_API_KEY=sk-...
QDRANT_URL=http://localhost:6333
GREEN_API_INSTANCE=...
GREEN_API_TOKEN=...
```

### tRPC Routers

```
auth.ts            # (existing)
tenant.ts          # create, update, getMembers, invite, removeMember
customer.ts        # CRUD, changeStatus, assign, bulkUpdate, search
customerStatus.ts  # CRUD, reorder
customField.ts     # CRUD definitions
conversation.ts    # list, getMessages, sendMessage, toggleBot
knowledge.ts       # upload, create, delete, list, getStatus
automation.ts      # CRUD flows, enable/disable, testRun, getLogs
webhook.ts         # create, delete, list, getToken
dashboard.ts       # getStats, getFunnel, getMessageChart
note.ts            # create, update, delete, list
activity.ts        # list (per customer timeline)
search.ts          # global search
```

All use `protectedProcedure` with tenant scoping middleware.

### Real-time

SSE via Hono for: new messages, bot handoffs, dashboard updates. Not WebSockets — simpler, sufficient for notifications + chat.
