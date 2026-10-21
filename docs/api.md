# REST API Reference Manual

The connectCampus API adheres to standard REST conventions using JSON payloads over HTTP. Protected endpoints require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

Standard Envelope Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully."
}
```

Standard Error Response:
```json
{
  "success": false,
  "error": "Detailed explanation of validation or authentication error."
}
```

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Create a new academic student, faculty, or club account.
- **Request Body**:
  ```json
  {
    "fullName": "Aarav Sharma",
    "email": "aarav.sharma@campus.edu",
    "password": "Password@123",
    "departmentId": "dept-cse-id",
    "batch": "2023-2027",
    "studentId": "23CS042"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "...", "fullName": "Aarav Sharma", "email": "aarav.sharma@campus.edu", "role": "STUDENT" },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

### `POST /api/auth/login`
Authenticate using campus email and password.
- **Request Body**:
  ```json
  {
    "email": "abdul.ahad@campus.edu",
    "password": "Campus@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "usr-student-1",
        "email": "abdul.ahad@campus.edu",
        "fullName": "Abdul Ahad",
        "role": "STUDENT",
        "department": { "id": "dept-cse", "name": "Computer Science & Engineering", "code": "CSE" }
      },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

### `POST /api/auth/refresh`
Rotate access token using an active refresh token.
- **Request Body**: `{ "refreshToken": "..." }`
- **Response `200 OK`**: `{ "accessToken": "...", "refreshToken": "..." }`

---

## 2. Chat & Messaging (`/api/chat`)

### `GET /api/chat/conversations`
List all conversation threads (direct, group, department, club) for the authenticated user.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "conv-placement-2026",
        "type": "PLACEMENT_FORUM",
        "title": "Campus Placement Drive 2026",
        "isUnread": false,
        "latestMessage": {
          "id": "msg-101",
          "content": "Deloitte technical round shortlist published.",
          "senderName": "Dr. Sharma",
          "createdAt": "2026-10-22T03:00:00.000Z"
        }
      }
    ]
  }
  ```

### `GET /api/chat/conversations/:id/messages`
Retrieve paginated messages for a conversation thread.
- **Query Params**: `limit` (default 50), `cursor` (optional message ID for cursor-based pagination)
- **Response `200 OK`**: Returns array of messages with sender profile, reactions, and attachments.

### `POST /api/chat/conversations/:id/messages`
Send a message via HTTP fallback (prefer Socket.IO in client).
- **Request Body**:
  ```json
  {
    "content": "Could anyone share the syllabus for CS402?",
    "replyToId": null
  }
  ```

### `POST /api/chat/messages/:id/reactions`
Toggle emoji reaction on a message.
- **Request Body**: `{ "emoji": "👍" }`
- **Response `200 OK`**: `{ "action": "added", "emoji": "👍" }`

---

## 3. Announcements (`/api/announcements`)

### `GET /api/announcements`
Retrieve active announcements ordered by priority (`URGENT` first) and pinned status.
- **Query Params**: `departmentId`, `category`, `search`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "ann-1",
        "title": "Deloitte Campus Recruitment 2026 Drive Notice",
        "content": "Online assessment scheduled for Saturday...",
        "priority": "URGENT",
        "category": "PLACEMENT",
        "author": { "fullName": "Dr. Rajesh Sharma", "role": "FACULTY" },
        "createdAt": "2026-10-21T18:00:00.000Z"
      }
    ]
  }
  ```

### `POST /api/announcements`
Publish an announcement (`FACULTY`, `DEPARTMENT_ADMIN`, or `SUPER_ADMIN` only).
- **Request Body**:
  ```json
  {
    "title": "Mid-Term Examination Schedule Released",
    "content": "Timetable is available on the departmental portal.",
    "priority": "IMPORTANT",
    "category": "EXAM",
    "departmentId": "dept-cse"
  }
  ```

---

## 4. Events (`/api/events`)

### `GET /api/events`
Fetch upcoming campus hackathons, workshops, and lectures.
- **Query Params**: `upcoming` (boolean), `clubId`, `departmentId`
- **Response `200 OK`**: Returns list of events including registration count and current user's registration status.

### `POST /api/events/:id/register`
RSVP for an event.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": { "registrationId": "reg-99", "status": "REGISTERED" },
    "message": "Registered for event successfully."
  }
  ```

---

## 5. Academic Resources (`/api/resources`)

### `GET /api/resources`
Query curated course materials, lecture notes, lab manuals, and previous papers.
- **Query Params**: `departmentId`, `category`, `courseCode`, `search`

### `POST /api/resources/:id/download`
Increment resource download telemetry counter and return file URL.

---

## 6. Campus AI Assistant (`/api/ai`)

### `POST /api/ai/chat`
Ask campus policy, academic schedule, or placement eligibility queries. Grounded in university documents.
- **Request Body**:
  ```json
  {
    "query": "What are the attendance criteria for mid-term exams?",
    "conversationId": null,
    "mode": "CAMPUS_QA"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "answer": "According to the Academic Regulations Handbook 2025-2026, students must maintain a minimum of 75% aggregate attendance...",
      "citations": [
        {
          "documentTitle": "Academic Regulations Handbook 2025-2026",
          "chunkIndex": 12,
          "source": "Office of the Dean of Academics"
        }
      ]
    }
  }
  ```

---

## 7. Administrative Oversight (`/api/admin`)

*Protected: requires `SUPER_ADMIN` or `DEPARTMENT_ADMIN` role.*

### `GET /api/admin/stats`
Returns system metrics: total registered users by role, active conversations, weekly message volume, open reports.

### `PATCH /api/admin/users/:id/status`
Suspend or reinstate an account.
- **Request Body**: `{ "isActive": false, "reason": "Violation of honor code." }`
