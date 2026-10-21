# Local Development & Deployment Guide

This guide provides instructions to run **connectCampus** locally for development or deploy via Docker containers.

---

## 1. System Requirements

- **Node.js**: v18.0.0 or later (v20+ / v22+ recommended)
- **Package Manager**: npm v9+
- **Operating System**: Windows 10/11, macOS, or Linux
- **Optional**: Docker & Docker Compose (for production containerization)

---

## 2. Quickstart (Zero-Dependency Local Setup)

connectCampus is configured with an embedded SQLite database (`server/prisma/dev.db`) and an in-memory Redis fallback so you can run the entire platform immediately without installing external database servers or Docker.

### Step 1: Install Dependencies
From the repository root:
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy the root `.env.example` file:
```bash
cp .env.example .env
```

The default `.env` is pre-configured for instant execution:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=super-secret-campus-jwt-key-2026-production-ready
JWT_REFRESH_SECRET=super-secret-campus-refresh-jwt-key-2026-production-ready
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=25
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=
```

### Step 3: Initialize Database & Seed Academic Data
Generate the Prisma Client, push schema tables, and populate 22 verified campus accounts, department channels, announcements, events, resources, and RAG knowledge chunks:
```bash
# Push schema tables to dev.db
npm run prisma:push --workspace=server

# Seed realistic university data
npm run seed --workspace=server
```

### Step 4: Start Development Servers
Run both backend API (Port 5000) and frontend client (Port 5173) simultaneously:
```bash
npm run dev
```
Or start individually in separate terminals:
```bash
# Terminal 1: Backend Server (Node.js ES Modules with --watch)
npm run dev:server

# Terminal 2: Frontend Client (Vite HMR)
npm run dev:client
```

Open your browser at: **`http://localhost:5173`**

---

## 3. Seeded Demo Accounts

All seeded accounts share the default development password: **`Campus@123`**

| Role | Name | Email | Department / Specialization |
|---|---|---|---|
| **Student** | Abdul Ahad | `abdul.ahad@campus.edu` | Computer Science & Eng. (Batch 2022-2026) |
| **Faculty** | Dr. Rajesh Sharma | `prof.sharma@campus.edu` | Computer Science & Eng. (Placement Officer) |
| **Club Coordinator**| Vikram Singh | `vikram.singh@campus.edu` | Electronics & Comm. (President, Coding Club) |
| **Dept Admin** | Dr. Meenakshi Sundaram | `dept.admin@campus.edu` | Computer Science & Eng. (Head of Dept) |
| **Super Admin** | Dr. Elizabeth Vance | `admin@campus.edu` | University Administration |

---

## 4. Running Automated Tests

Run the full end-to-end test suite (14 backend integration/security tests and 8 frontend Zustand/UI store tests):
```bash
npm test
```

To run individual workspaces:
```bash
# Backend tests (Vitest + Supertest)
npm test --workspace=server

# Frontend tests (Vitest)
npm test --workspace=client
```

---

## 5. Docker Production Deployment

To run connectCampus with containerized PostgreSQL 16 (with pgvector), Redis 7, Express Node API, and Nginx:

```bash
# Build and run all services in background
docker-compose up --build -d

# Verify container health
docker-compose ps

# Run database migrations and seed inside server container
docker-compose exec server npm run prisma:push
docker-compose exec server npm run seed
```

The application will be served at:
- Frontend: `http://localhost:80` (or configured port)
- Backend API: `http://localhost:5000/api`

To stop containers:
```bash
docker-compose down
```

---

## 6. Troubleshooting

- **Port Conflict (EADDRINUSE: 5000 or 5173)**:
  - If port 5000 is occupied, update `PORT=5001` in `.env` and `target` in `client/vite.config.js`.
- **Database Drift / Reset**:
  - Run `rm server/prisma/dev.db` followed by `npm run prisma:push --workspace=server` and `npm run seed --workspace=server`.
- **Redis Connection Warnings**:
  - If a Redis server is not running locally, the server logs a notice and automatically falls back to the built-in in-memory cache with zero disruption.
