# connectCampus

> **Your campus, in one place.**
> A unified, real-time communication and collaboration platform designed for university students, faculty, departments, student clubs, and placement cells.

[![License: MIT](https://img.shields.io/badge/License-MIT-245C4A.svg)](LICENSE)
[![Runtime: Node.js](https://img.shields.io/badge/Runtime-Node.js%20ES%20Modules-245C4A.svg)](https://nodejs.org/)
[![Client: React 19](https://img.shields.io/badge/Client-React%2019%20%2B%20Vite-245C4A.svg)](https://react.dev/)
[![Database: Prisma 6](https://img.shields.io/badge/Database-Prisma%206%20ORM-245C4A.svg)](https://www.prisma.io/)
[![Real-Time: Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO%20v4-C66A4A.svg)](https://socket.io/)
[![Tests: Vitest](https://img.shields.io/badge/Tests-Passing%20(22%2F22)-3F7658.svg)](https://vitest.dev/)

---

## 1. Product Philosophy & Editorial Aesthetic

connectCampus was designed and built to reflect the calm, practical, and trustworthy atmosphere of an academic institution. It avoids the neon visual clichés of generic SaaS applications, crypto dashboards, and gaming chat platforms.

- **Restrained University Palette**:
  - **Forest Green (`#245C4A`)**: Primary navigation, active indicators, and high-priority branding.
  - **Terracotta (`#C66A4A`)**: Subtle accent for unread indicators, calendar events, and key calls-to-action.
  - **Warm Off-White (`#F7F5F0`)**: Page background designed for sustained readability during research and study sessions.
  - **Deep Charcoal (`#242622`)**: High-contrast, accessible body and headline typography.
- **Academic Typography**:
  - **Headings**: *DM Serif Display* — editorial dignity for announcements and major sections.
  - **Body / Interface**: *Source Sans 3* — legible, crisp typography for conversations, data tables, and metadata.
- **Strict Anti-Cliché Rules**:
  - Zero purple/neon gradients, zero glassmorphism, zero floating orbs.
  - Zero decorative robot/rocket emojis in interface headings, buttons, and empty states.
  - Realistic academic data: genuine course codes, placement notifications, and faculty announcements.

---

## 2. System Architecture

```
                          +------------------------------------------+
                          |        Web Client (React 19 + JSX)       |
                          |   Vite + Tailwind CSS + Lucide + Zustand |
                          +--------------------+---------------------+
                                               |
                             HTTPS / REST      |      WSS / Socket.IO
                                               v
                          +------------------------------------------+
                          |       Node.js (ES Modules) API Gateway   |
                          |        Express 4 + Helmet + Rate Limit   |
                          +--------------------+---------------------+
                                               |
                     +-------------------------+-------------------------+
                     |                         |                         |
                     v                         v                         v
         +-----------------------+ +-----------------------+ +-----------------------+
         |    Service Layer      | |  Real-Time Presence   | |    Campus AI RAG      |
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

## 3. Key Feature Modules

### 💬 Real-Time Messaging & Channels
- **Threaded Conversations**: Direct 1-on-1 chats, departmental batch cohorts, club channels, and placement forums.
- **Rich Message Interactions**: Emoji reactions, threaded replies, pinning important notes, and file attachments.
- **Live Presence & Typing**: Real-time typing indicators with debounced broadcasts and online/offline status indicators.
- **Optimistic UI Updates**: Instant message rendering in the chat stream with automatic background synchronization.

### 🏛️ Department Communities & Batches
- **Institutional Hierarchy**: Dedicated spaces for Computer Science, Electronics, Mechanical, Civil, and Management departments.
- **Role Permissions**: Department Heads and faculty can post official syllabus updates, while students interact in cohort channels.

### 🎯 Student Clubs & Societies
- **Campus Life Hub**: Coding Club, Robotics Society, Literary & Debating Club, and Arts Society.
- **Membership Management**: Join/leave clubs with a single click, track active leadership rosters, and participate in club channels.

### 📢 Authoritative Announcements
- **Priority-Classified Notices**: Categorized by `ROUTINE`, `IMPORTANT`, and `URGENT`.
- **Targeted Audiences**: Institution-wide broadcasts or department-specific notices (exam timetables, fee deadlines, placement schedules).
- **Pinned Banners**: Critical alerts pinned to the top of student dashboards.

### 📅 Campus Events & RSVP System
- **Event Discovery**: Annual Hackathons, technical symposiums, guest speaker seminars, and campus orientation.
- **Capacity & RSVP**: Real-time seat counters, registration deadlines, and instant attendance status toggles.

### 📚 Academic Resource Repository
- **Curated Knowledge Base**: Previous year exam question papers, verified lecture notes, lab manuals, and placement preparation cheatsheets.
- **Course Code Filtering**: Search by department, semester, and course codes (e.g., `CS401`, `EC302`).
- **Telemetry**: Live download counters for community resource ranking.

### 🔍 Global Omnisearch
- **Keyboard Shortcut**: Press <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>⌘</kbd> + <kbd>K</kbd>) anywhere on the platform.
- **Multi-Entity Indexing**: Instant search across channels, peer students, faculty members, announcements, and study files.

### 🤖 Campus AI Knowledge Assistant (RAG)
- **Grounded in Verified Documents**: Retrieves answers exclusively from official institutional handbooks, academic regulations, and placement policy documents.
- **Verifiable Citations**: Every generated answer includes clickable citations detailing the document title, issuing office, and clause number.
- **Anti-Hallucination Guardrails**: Explicitly refuses to invent dates, grades, or requirements not present in official university records.

### 🛡️ Administrative Dashboard & Moderation
- **Executive Metrics**: Live telemetry displaying total students, faculty accounts, message throughput, and open reports.
- **User Governance**: Search, inspect, and toggle active/suspended statuses of university accounts.
- **Community Safety**: Review student reports on inappropriate content with one-click resolution workflows.

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, JavaScript (ESM + JSX), Vite, Tailwind CSS, Lucide React, Zustand, TanStack React Query, Axios, Socket.IO Client |
| **Backend** | Node.js (ES Modules), Express 4, Socket.IO v4, Prisma 6 ORM, Zod, JWT, bcrypt, Helmet, Express Rate Limit, Multer |
| **Database** | SQLite (`dev.db` for zero-install local dev), PostgreSQL 16 + pgvector (for Docker production) |
| **Caching & Presence** | Redis 7 (with transparent in-memory fallback) |
| **Testing** | Vitest, Supertest (100% automated test coverage across API and UI stores) |
| **DevOps** | Docker, Docker Compose, Multi-stage Dockerfiles, Nginx reverse proxy |

---

## 5. Seeded Demo Accounts

All pre-seeded demo accounts use the standard development password: **`Campus@123`**

| Role | Name | Email | Persona Details |
|---|---|---|---|
| **Student** | Abdul Ahad | `abdul.ahad@campus.edu` | B.Tech CSE (Batch 2022-2026), Active Club Member |
| **Faculty** | Dr. Rajesh Sharma | `prof.sharma@campus.edu` | Associate Professor, CSE & Placement Faculty Coordinator |
| **Club Coordinator** | Vikram Singh | `vikram.singh@campus.edu` | President, Campus Coding Club |
| **Department Admin** | Dr. Meenakshi Sundaram | `dept.admin@campus.edu` | Head of Department, Computer Science & Engineering |
| **Super Admin** | Dr. Elizabeth Vance | `admin@campus.edu` | University Registrar & Platform Administrator |

---

## 6. Quickstart & Local Setup

### Prerequisites
- Node.js v18.0.0+ (v20+ or v22+ recommended)
- npm v9+

### Step-by-Step Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/connectCampus.git
   cd connectCampus
   ```

2. **Install Workspaces Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   *(The default `.env` is pre-configured with local defaults for SQLite and in-memory caching.)*

4. **Initialize Database & Seed Realistic Campus Data**:
   ```bash
   # Push schema to SQLite database (dev.db)
   npm run prisma:push --workspace=server

   # Populate 22 realistic university accounts, channels, notices, events, and RAG documents
   npm run seed --workspace=server
   ```

5. **Start Development Environment**:
   ```bash
   npm run dev
   ```
   - **Frontend UI**: [`http://localhost:5173`](http://localhost:5173)
   - **Backend API & Sockets**: [`http://localhost:5000`](http://localhost:5000)
   - **Health Check**: [`http://localhost:5000/api/health`](http://localhost:5000/api/health)

---

## 7. Running Tests

Run the full automated test suite (14 backend integration/security tests and 8 frontend Zustand store tests):

```bash
npm test
```

To run individual workspaces:
```bash
npm test --workspace=server    # Backend Supertest & Vitest suite
npm test --workspace=client    # Frontend Zustand store test suite
```

---

## 8. Docker Production Deployment

To run connectCampus with containerized PostgreSQL 16 (with pgvector), Redis 7, Express Node API, and Nginx:

```bash
# Start all containers in the background
docker-compose up --build -d

# Verify container health
docker-compose ps

# Push database schema and seed inside server container
docker-compose exec server npm run prisma:push
docker-compose exec server npm run seed
```

The application is served at:
- Web Client: `http://localhost:80`
- API Gateway: `http://localhost:5000/api`

---

## 9. Repository Structure

```
connectCampus/
├── client/                     # Frontend Single Page Application
│   ├── src/
│   │   ├── components/         # Design primitives (Button, Input, Badge, Avatar, Modal, etc.)
│   │   ├── layouts/            # AppLayout and PublicLayout
│   │   ├── pages/              # Landing, Login, Register, Dashboard, Chat, Communities, etc.
│   │   ├── services/           # Axios HTTP client, Socket.IO client, API wrappers
│   │   ├── stores/             # Zustand reactive state stores
│   │   ├── hooks/              # Custom hooks (useSocket, useDebounce, usePageTitle)
│   │   ├── utils/              # Formatting helpers and utility functions
│   │   ├── App.jsx             # React Router routing configuration
│   │   └── main.jsx            # React root mount point
│   ├── test/                   # Vitest unit and store test suite
│   ├── package.json
│   ├── vite.config.js          # Vite build config with optimized chunking
│   └── tailwind.config.js      # Palette and font styling system
│
├── server/                     # Backend API & Real-Time Engine (Plain JavaScript ESM)
│   ├── prisma/
│   │   ├── schema.prisma       # SQLite local development schema
│   │   ├── schema.postgresql.prisma # PostgreSQL + pgvector schema
│   │   └── seed.js             # Realistic academic seeder
│   ├── src/
│   │   ├── config/             # Environment, Prisma, Redis, Multer uploads
│   │   ├── controllers/        # REST route controllers
│   │   ├── middleware/         # Auth, role authorization, error handling
│   │   ├── routes/             # Express route registries
│   │   ├── services/           # Business logic and database operations
│   │   ├── sockets/            # Socket.IO connection handling and room store
│   │   ├── utils/              # JWT, response formatters, AppError
│   │   ├── validators/         # Zod request validation schemas
│   │   ├── app.js              # Express app setup and middleware pipeline
│   │   └── server.js           # HTTP + Socket.IO server listener
│   ├── test/                   # Vitest Supertest API test suite
│   └── package.json
│
├── docs/                       # Technical Specifications & Manuals
│   ├── architecture.md         # Detailed system and real-time architecture
│   ├── database.md             # Entity relationships, schema models, and indexes
│   ├── api.md                  # REST API reference and sample payloads
│   ├── websocket.md            # Socket.IO event dictionary and frame schemas
│   ├── ai.md                   # Campus AI Knowledge Assistant & RAG pipeline
│   └── setup.md                # Development, troubleshooting, and Docker guide
│
├── docker/                     # Container configurations & Nginx reverse proxy
├── docker-compose.yml          # Production multi-service orchestration
├── .env.example                # Sample environment configuration
├── .gitignore
├── LICENSE                     # MIT License
└── README.md                   # Project documentation
```

---

## 10. Documentation Directory

For in-depth technical details, refer to the documentation in [`docs/`](docs/):
- [Architecture & Design Principles](docs/architecture.md)
- [Database Schema & Entity Models](docs/database.md)
- [REST API Reference](docs/api.md)
- [WebSocket & Real-Time Events](docs/websocket.md)
- [Campus AI Knowledge Assistant & RAG](docs/ai.md)
- [Setup & Deployment Guide](docs/setup.md)

---

## 11. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
