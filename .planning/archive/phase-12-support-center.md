# Phase 12 — PartsPeddle Support Center (PSC)

**Date:** 2026-07-09
**Branch:** `feat/phase-12-support-center`
**Base:** `develop`
**Goal:** Build a lightweight customer support system integrated into PartsPeddle.

---

## Problem

PartsPeddle currently has a `/chat` placeholder but no canonical support domain. Building a real-time chat from scratch is heavy. Instead, PSC models a **Support Conversation** as the canonical object, enabling chat, email, AI bot, and human agents to share one backend.

---

## Three-Phase Rollout

### Phase 12a — MVP (1–2 days)

- Floating `SupportLauncher`
- `SupportMessenger` widget
- Supabase-backed `support_conversations` and `support_messages`
- Supabase Realtime for live message updates
- Basic admin inbox
- Human-to-user messaging only

### Phase 12b — AI Assistant

- Bot pipeline integrated into the same conversation model
- Algolia retrieval over Help Center / policies / FAQs as LLM context
- Automatic escalation to human agents on low confidence or sensitive topics

### Phase 12c — Marketplace Context

- Open conversations from orders, listings, seller profiles, payments
- Attach contextual entities to conversations
- Provide agents with relevant metadata without user repetition

---

## UX

### Desktop

- Floating `SupportLauncher` button bottom-right
- Click opens `SupportMessenger` drawer

### Messenger states

1. **Welcome:** suggested topics (Track Order, Return, Sell Parts, Contact Sales)
2. **Conversation:** message history, input, attachment button
3. **Human joined:** system message, same UI

---

## Data Model

### `support_conversations`

- `id`
- `created_by`
- `status` (open, waiting_customer, waiting_agent, closed)
- `subject`
- `channel`
- `assigned_to`
- `created_at`, `updated_at`, `closed_at`

### `support_messages`

- `id`
- `conversation_id`
- `sender_type` (user, agent, bot, system)
- `sender_id`
- `message`
- `attachments`
- `created_at`

### `support_participants`

- `conversation_id`
- `user_id`
- `role`
- `joined_at`

### `support_attachments`

- `id`
- `message_id`
- `storage_path`
- `mime`
- `size`

---

## PPDS Components

| Component              | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `SupportLauncher`      | Floating chat trigger with unread states |
| `SupportMessenger`     | Chat window shell                        |
| `ConversationBubble`   | User / bot / agent / system message      |
| `SupportAvatar`        | Avatar for sender types                  |
| `SupportStatus`        | Online / away / offline indicator        |
| `SuggestionChip`       | One-click conversation starters          |
| `AttachmentCard`       | Inline file/entity rendering             |
| `ConversationHeader`   | Title, status, close/minimize            |
| `ConversationComposer` | Input, attachments, send                 |
| `ConversationTimeline` | Scrollable history with date separators  |

---

## Architecture

```
Next.js Client
  ↓
API Routes (/api/support/*)
  ↓
Conversation Service
  ↓
Supabase (Postgres + Realtime + Storage)
```

Realtime subscription channel: `conversation:{id}` on `support_messages`.

---

## API Routes

- `POST /api/support/conversation` — create conversation
- `POST /api/support/message` — add message
- `GET /api/support/history` — list user conversations
- `POST /api/support/close` — close conversation

---

## Security

- RLS: users read only conversations they belong to
- Support role: agents read assigned conversations
- Bot: service role

---

## Algolia Integration

Before generating a response:

1. Detect user intent
2. Search Algolia for relevant articles/policies
3. Inject results as context
4. LLM generates grounded response

---

## Acceptance Criteria

- [ ] MVP launcher + messenger render on all marketplace pages.
- [ ] Conversations persist in Supabase.
- [ ] Realtime updates work across sessions.
- [ ] Admin inbox lists open/waiting/closed conversations.
- [ ] AI assistant answers from Algolia-indexed help content.
- [ ] Sensitive topics escalate to human agents.
