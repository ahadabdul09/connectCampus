# Real-Time WebSocket Specification

connectCampus leverages Socket.IO v4 for real-time bi-directional messaging, presence management, typing indicators, and notification streaming.

---

## 1. Connection & Handshake

Clients connect to the root namespace `/` with authentication credentials passed via the auth payload or handshake headers:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: accessToken,
  },
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

### Server Validation
The server verifies the JWT signature in `socketHandler.js`. On failure, the connection is rejected with an `Authentication error` packet. On success:
- User is joined to their private channel: `user:<userId>`
- User is joined to their department channel: `dept:<departmentId>`
- Presence status is updated in Redis and broadcasted to peer contacts.

---

## 2. Event Reference

### Client -> Server Events

| Event Name | Payload Schema | Description |
|---|---|---|
| `conversation:join` | `{ conversationId: string }` | Joins the conversation room `conversation:<id>`. |
| `conversation:leave` | `{ conversationId: string }` | Leaves the active room. |
| `message:send` | `{ conversationId: string, content: string, replyToId?: string, attachment?: object }` | Sends a message into the conversation thread. |
| `message:typing` | `{ conversationId: string, isTyping: boolean }` | Emits typing state; auto-cleared after 1500ms inactivity. |
| `message:read` | `{ conversationId: string, messageId?: string }` | Emits read receipt; marks unread messages as read. |
| `reaction:toggle` | `{ messageId: string, emoji: string }` | Adds or removes an emoji reaction from a message. |

### Server -> Client Broadcast Events

| Event Name | Payload Schema | Description |
|---|---|---|
| `message:received` | `{ message: MessageObject }` | Delivered to all members in `conversation:<id>`. |
| `conversation:typing` | `{ conversationId: string, userId: string, fullName: string, isTyping: boolean }` | Broadcasted to other users in the room. |
| `message:updated` | `{ messageId: string, content: string, isEdited: true, updatedAt: string }` | Sent when an author modifies their message. |
| `message:deleted` | `{ messageId: string, conversationId: string }` | Sent when a message is deleted by author/moderator. |
| `reaction:updated` | `{ messageId: string, reactions: Array<{ emoji, count, users }> }` | Sent when a reaction is added or removed. |
| `notification:new` | `{ id: string, title: string, body: string, link: string, type: string }` | Delivered directly to `user:<userId>`. |
| `user:presence` | `{ userId: string, isOnline: boolean, lastSeenAt: string }` | Broadcasted on sign-in or disconnect. |

---

## 3. Sample Payloads

### Sending a Chat Message
```json
// Emitted on: message:send
{
  "conversationId": "conv-placement-2026",
  "content": "Does anyone know if the resume submission deadline is 5 PM or midnight?",
  "replyToId": null
}
```

### Receiving a Real-Time Notification
```json
// Received on: notification:new
{
  "id": "notif-uuid-42",
  "title": "Placement Drive Update",
  "body": "Deloitte shortlisting round begins tomorrow at 9:00 AM.",
  "type": "ANNOUNCEMENT",
  "link": "/chat?conversationId=conv-placement-2026",
  "createdAt": "2026-10-22T04:00:00.000Z"
}
```

---

## 4. Reconnection & Resilience

- **Optimistic State**: Chat messages in the UI are queued optimistically with a unique client ID, marked with a clock icon until the server acknowledges receipt.
- **Heartbeat & Keepalive**: Ping interval is 25 seconds with a 20-second timeout.
- **Network Recovery**: Upon reconnection, the client automatically re-joins active conversation rooms and refetches missing message intervals using the `since` timestamp filter.
