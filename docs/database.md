# Database Architecture & Entity Models

connectCampus uses Prisma 6 with a dual-database design strategy:
- **SQLite (`server/prisma/schema.prisma`)**: Used for zero-dependency local development and rapid test execution without requiring Docker or a running PostgreSQL daemon.
- **PostgreSQL 16 (`server/prisma/schema.postgresql.prisma`)**: Configured for containerized Docker environments with native support for `pgvector` indexing and concurrent connection pooling.

---

## 1. Entity-Relationship Overview

```
 [Department] 1----* [User] 1----* [ConversationMember] *----1 [Conversation]
      |               |                  |                              |
      |               |                  v                              v
      +---* [Channel] +----* [Message] *---+                     [Message] 1----* [Attachment]
      |                      |                                          |
      +---* [Announcement]   +---* [MessageReaction]                    +----* [MessageReaction]
      |
 [Club] 1----* [ClubMember] *----1 [User]
   |
   +----* [Event] 1----* [EventRegistration] *----1 [User]
   |
   +----* [Resource] 1----* [User (Uploader)]

 [Document] 1----* [DocumentChunk] (Campus AI RAG Engine)
 [User] 1----* [Notification]
 [User] 1----* [RefreshToken]
 [User] 1----* [Report (Reporter / Reported)]
 [User] 1----* [AIConversation]
```

---

## 2. Core Entity Definitions

### 1. `User`
Academic persona containing institutional identifiers, credentials, and verification status.
- `id`: String (UUID / CUID) `[PK]`
- `email`: String `[UNIQUE]` — institutional email (e.g., `@campus.edu`)
- `passwordHash`: String — bcrypt salted hash
- `fullName`: String
- `role`: Enum / String (`STUDENT`, `FACULTY`, `CLUB_COORDINATOR`, `DEPARTMENT_ADMIN`, `SUPER_ADMIN`)
- `avatarUrl`: String?
- `bio`: String?
- `departmentId`: String? `[FK -> Department.id]`
- `batch`: String? (e.g. `2022-2026`)
- `studentId`: String? (e.g. `22CS104`)
- `isOnline`: Boolean (default `false`)
- `lastSeenAt`: DateTime?
- `isActive`: Boolean (default `true`)

### 2. `Department`
Academic branch organizing students, faculty, and official course channels.
- `id`: String `[PK]`
- `name`: String (e.g. "Computer Science & Engineering")
- `code`: String `[UNIQUE]` (e.g. "CSE")
- `description`: String?
- `building`: String?
- `headOfDepartment`: String?

### 3. `Conversation` & `ConversationMember`
Represents direct messages (1-on-1), group chats, department cohort channels, or placement discussions.
- `Conversation`:
  - `id`: String `[PK]`
  - `type`: String (`DIRECT`, `GROUP`, `DEPARTMENT_CHANNEL`, `CLUB_CHANNEL`, `PLACEMENT_FORUM`)
  - `title`: String?
  - `description`: String?
  - `departmentId`: String? `[FK -> Department.id]`
  - `clubId`: String? `[FK -> Club.id]`
  - `lastMessageAt`: DateTime?
- `ConversationMember`:
  - `id`: String `[PK]`
  - `conversationId`: String `[FK -> Conversation.id]`
  - `userId`: String `[FK -> User.id]`
  - `role`: String (`MEMBER`, `MODERATOR`, `ADMIN`)
  - `joinedAt`: DateTime
  - `lastReadAt`: DateTime?

### 4. `Message`, `Attachment` & `MessageReaction`
Rich messaging engine supporting replies, reactions, and academic attachments.
- `Message`:
  - `id`: String `[PK]`
  - `conversationId`: String `[FK -> Conversation.id]`
  - `senderId`: String `[FK -> User.id]`
  - `content`: Text
  - `replyToId`: String? `[FK -> Message.id]`
  - `isEdited`: Boolean (default `false`)
  - `isPinned`: Boolean (default `false`)
  - `createdAt`: DateTime
  - `updatedAt`: DateTime
- `Attachment`:
  - `id`: String `[PK]`
  - `messageId`: String? `[FK -> Message.id]`
  - `fileName`: String
  - `fileUrl`: String
  - `fileSize`: Int (bytes)
  - `mimeType`: String
- `MessageReaction`:
  - `id`: String `[PK]`
  - `messageId`: String `[FK -> Message.id]`
  - `userId`: String `[FK -> User.id]`
  - `emoji`: String (e.g. `👍`, `❤️`, `🎉`, `💡`)

### 5. `Announcement`
Authoritative campus notices published by faculty, department administrators, or super administrators.
- `id`: String `[PK]`
- `title`: String
- `content`: Text
- `priority`: String (`ROUTINE`, `IMPORTANT`, `URGENT`)
- `category`: String (`ACADEMIC`, `EXAM`, `PLACEMENT`, `ADMINISTRATIVE`, `CAMPUS_LIFE`)
- `authorId`: String `[FK -> User.id]`
- `departmentId`: String? `[FK -> Department.id]`
- `pinnedUntil`: DateTime?
- `expiresAt`: DateTime?

### 6. `Event` & `EventRegistration`
University hackathons, tech fests, guest lectures, and placement orientation drives.
- `Event`:
  - `id`: String `[PK]`
  - `title`: String
  - `description`: Text
  - `location`: String (e.g., "Auditorium Hall B")
  - `startDate`: DateTime
  - `endDate`: DateTime
  - `organizerId`: String `[FK -> User.id]`
  - `clubId`: String? `[FK -> Club.id]`
  - `departmentId`: String? `[FK -> Department.id]`
  - `capacity`: Int?
  - `registrationDeadline`: DateTime?
  - `isPublished`: Boolean
- `EventRegistration`:
  - `id`: String `[PK]`
  - `eventId`: String `[FK -> Event.id]`
  - `userId`: String `[FK -> User.id]`
  - `status`: String (`REGISTERED`, `ATTENDED`, `CANCELLED`)
  - `registeredAt`: DateTime

### 7. `Resource`
Curated academic course packs, lecture notes, syllabus copies, previous year question papers, and placement cheatsheets.
- `id`: String `[PK]`
- `title`: String
- `description`: String?
- `category`: String (`SYLLABUS`, `LECTURE_NOTES`, `QUESTION_PAPER`, `LAB_MANUAL`, `PLACEMENT_GUIDE`, `RESEARCH_PAPER`)
- `fileUrl`: String
- `fileName`: String
- `fileSize`: Int
- `fileType`: String
- `uploaderId`: String `[FK -> User.id]`
- `departmentId`: String? `[FK -> Department.id]`
- `courseCode`: String? (e.g. `CS401`)
- `downloadCount`: Int (default `0`)

### 8. `Document` & `DocumentChunk` (Campus AI RAG)
Official university handbook, curriculum guides, and placement FAQs indexed for contextual semantic citation.
- `Document`:
  - `id`: String `[PK]`
  - `title`: String
  - `category`: String
  - `source`: String
- `DocumentChunk`:
  - `id`: String `[PK]`
  - `documentId`: String `[FK -> Document.id]`
  - `content`: Text
  - `chunkIndex`: Int
  - `embedding`: String? (serialized vector representation)
  - `metadata`: String? (JSON serialized)

---

## 3. Database Indexes & Query Optimizations

| Table | Index Columns | Purpose |
|-------|---------------|---------|
| `User` | `email` | Rapid credential lookups and uniqueness enforcement |
| `User` | `departmentId`, `role` | Filtering batch cohorts and faculty rosters |
| `Message` | `conversationId`, `createdAt DESC` | Instant pagination of chat histories |
| `ConversationMember` | `userId`, `conversationId` | Member authorization check per socket frame |
| `Announcement` | `priority`, `createdAt DESC` | High-priority dashboard banner retrieval |
| `Event` | `startDate ASC`, `isPublished` | Upcoming timeline display |
| `Resource` | `departmentId`, `category` | Curated course pack filtering |
| `DocumentChunk` | `documentId`, `chunkIndex` | Citation context assembly |
