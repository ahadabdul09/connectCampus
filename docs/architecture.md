# System Architecture & Design

connectCampus is engineered with an editorial, human-centered philosophy designed for collegiate communities. The architecture balances real-time responsiveness, academic data isolation, role-based governance, and a retrieval-augmented intelligence layer.

```
                      +------------------------------------------+
                      |         Web Client (React 19 + JSX)      |
                      |   Vite + Tailwind CSS + Lucide + Zustand |
                      +--------------------+---------------------+
                                           |
                         HTTPS / REST      |      WSS / Socket.IO
                                           v
                      +------------------------------------------+
                      |       Node.js (ES Modules) API Gateway    |
                      |        Express 4 + Helmet + Rate Limit   |
                      +--------------------+---------------------+
                                           |
                 +-------------------------+-------------------------+
                 |                         |                         |
                 v                         v                         v
     +-----------------------+ +-----------------------+ +-----------------------+
     |   Service Layer       | |  Real-Time Presence   | |   Campus AI RAG       |
     | Auth, Chat, Community | |  SocketStore + Rooms  | | TF-IDF / Gemini Engine|
     | Events, Announcements | | Typing / ReadReceipts | | Chunk Retrieval & Cite|
     +-----------+-----------+ +-----------+-----------+ +-----------+-----------+
                 |                         |                         |
                 v                         v                         |
     +-----------------------+ +-----------------------+             |
     |   Prisma 6 ORM Client | |  Redis / Memory Store |             |
     | SQLite / PostgreSQL16 | | Presence / Rate Limits|             |
     +-----------+-----------+ +-----------------------+             |
                 |                                                   |
                 +-------------------------<-------------------------+
```

---

## 1. Architectural Principles

1. **Separation of Concerns**: Pure JavaScript ES Modules backend (`server/src/`) cleanly decoupled into validators, controllers, services, repositories, and real-time socket handlers.
2. **Dual-Environment Database Strategy**:
   - Zero-dependency local development via SQLite (`dev.db`).
   - Production containerized deployment via PostgreSQL 16 with `pgvector` index support.
3. **Resilient Real-Time Synchronization**: Socket.IO room subscriptions tied to authenticated user departments, registered clubs, and direct conversation rooms. Stateful fallback to in-memory caching if Redis instances are unavailable.
4. **Governed RAG (Retrieval-Augmented Generation)**: Campus AI engine grounded exclusively in official institutional documents, preventing hallucinated university deadlines or policies. Every answer includes verifiable source citations.

---

## 2. Frontend Architecture (`client/src/`)

The client is built using React 19 and modern JSX, styled according to the connectCampus brand system:
- **Palette**: Forest Green (`#245C4A`), Terracotta (`#C66A4A`), Warm Off-White (`#F7F5F0`), Deep Charcoal (`#242622`).
- **Typography**: DM Serif Display for editorial titles, Source Sans 3 for UI clarity and body text.
- **State Management**:
  - `useAuthStore`: JWT storage, active academic session, role claims.
  - `useChatStore`: Real-time conversation tracking, active message lists, optimistic updates, reactions.
  - `useNotificationStore`: Instant toast broadcasts and persistent unread badge counts.
- **Data Fetching & Cache**: TanStack React Query for background revalidation, query deduplication, and cache invalidation.
- **WebSocket Synchronization**: `useSocket` hook establishing automatic heartbeat, reconnect, and room mapping upon authentication.

### Directory Structure
```
client/
├── src/
│   ├── components/         # Shared design primitives (Button, Input, Badge, Avatar, Modal, etc.)
│   ├── layouts/            # AppLayout (nav, sidebar, drawer) & PublicLayout
│   ├── pages/              # Landing, Login, Register, Dashboard, Chat, Communities, etc.
│   ├── services/           # Axios HTTP client, Socket.IO client, API endpoint wrappers
│   ├── stores/             # Zustand reactive stores
│   ├── hooks/              # Custom hooks (useSocket, useDebounce, usePageTitle)
│   ├── utils/              # Formatting helpers, date formatting, style mergers
│   ├── App.jsx             # React Router route registry with role guards
│   └── main.jsx            # Application mount point with QueryClientProvider
```

---

## 3. Backend Architecture (`server/src/`)

The backend is built with plain JavaScript using Node.js ES Modules:

```
server/
├── prisma/
│   ├── schema.prisma       # SQLite primary schema for instant local setup
│   ├── schema.postgresql.prisma # PostgreSQL + pgvector schema for production
│   └── seed.js             # Comprehensive academic data seeder (22 users, 5 roles)
├── src/
│   ├── config/             # Environment, Prisma, Redis, Multer uploads
│   ├── controllers/        # Express HTTP route controllers
│   ├── middleware/         # authGuard, roleGuard, errorHandler, rateLimiter
│   ├── routes/             # Express Routers mapped by entity domain
│   ├── services/           # Pure business logic and database orchestration
│   ├── sockets/            # Socket.IO event listeners and socketStore
│   ├── utils/              # JWT helpers, response formatters, AppError
│   ├── validators/         # Zod input validation schemas
│   ├── app.js              # Express app configuration & middleware pipeline
│   └── server.js           # HTTP + Socket.IO server listener
```

---

## 4. Real-Time WebSocket Pipeline

The real-time layer operates over Socket.IO with strict JWT authentication on handshake:

1. **Handshake Authentication**: Client supplies access token in `socket.auth.token` or `Authorization` header.
2. **Room Allocation**:
   - `user:<userId>`: For targeted notifications, unread counters, and direct calls.
   - `dept:<deptId>`: For departmental broadcasts and urgent notices.
   - `conversation:<convId>`: For active chat threads, typing status, and read receipts.
3. **Typing Indicators**: Ephemeral typing events (`conversation:typing`) debounced at 1500ms to preserve network bandwidth.
4. **Presence**: Online/offline transitions broadcasted to mutual conversation members and cached in Redis.

---

## 5. Security & Academic Integrity

- **Role-Based Access Control (RBAC)**: Distinct permissions enforced at both route middleware and service levels for `STUDENT`, `FACULTY`, `CLUB_COORDINATOR`, `DEPARTMENT_ADMIN`, and `SUPER_ADMIN`.
- **Credential Storage**: Passwords hashed with bcrypt (salt rounds = 10).
- **Session Tokens**: Short-lived JWT access tokens (15 minutes) coupled with rotatable, revocable SHA-256 hashed refresh tokens (7 days).
- **Audit Logging**: Sensitive administrative actions (user suspension, club archiving) logged to the `Report` and audit tables.
