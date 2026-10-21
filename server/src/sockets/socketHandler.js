import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { SocketStore } from './socketStore.js';
import { ChatService } from '../services/chatService.js';

export function initializeSockets(io) {
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required for WebSocket connection.'));
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return next(new Error('Invalid or expired WebSocket authentication token.'));
    }

    socket.user = payload;
    next();
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    const userId = user.userId;

    socket.join(`user:${userId}`);
    await SocketStore.registerSocket(userId, socket.id);

    await prisma.user
      .update({
        where: { id: userId },
        data: { isOnline: true, lastSeenAt: new Date() },
      })
      .catch(() => {});

    io.emit('presence:online', {
      userId,
      isOnline: true,
      lastSeenAt: new Date(),
    });

    console.log(`[Socket] User connected: ${user.fullName} (${userId})`);

    socket.on('conversation:join', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on('conversation:leave', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on('message:send', async (payload, callback) => {
      try {
        const message = await ChatService.sendMessage(payload.conversationId, userId, payload);
        io.to(`conversation:${payload.conversationId}`).emit('message:new', message);
        if (callback) callback({ success: true, message });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('message:update', async ({ messageId, content }, callback) => {
      try {
        const updated = await ChatService.editMessage(messageId, userId, content);
        io.to(`conversation:${updated.conversationId}`).emit('message:update', updated);
        if (callback) callback({ success: true, message: updated });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('message:delete', async ({ messageId }, callback) => {
      try {
        const result = await ChatService.deleteMessage(messageId, userId, user.role);
        io.to(`conversation:${result.conversationId}`).emit('message:delete', {
          messageId,
          conversationId: result.conversationId,
        });
        if (callback) callback({ success: true });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId,
        fullName: user.fullName,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    socket.on('reaction:add', async ({ messageId, emoji }, callback) => {
      try {
        const reaction = await ChatService.addReaction(messageId, userId, emoji);
        const msg = await prisma.message.findUnique({
          where: { id: messageId },
          select: { conversationId: true },
        });

        if (msg) {
          io.to(`conversation:${msg.conversationId}`).emit('reaction:add', reaction);
        }
        if (callback) callback({ success: true, reaction });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('reaction:remove', async ({ messageId, emoji }, callback) => {
      try {
        const result = await ChatService.removeReaction(messageId, userId, emoji);
        const msg = await prisma.message.findUnique({
          where: { id: messageId },
          select: { conversationId: true },
        });

        if (msg) {
          io.to(`conversation:${msg.conversationId}`).emit('reaction:remove', result);
        }
        if (callback) callback({ success: true });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('message:read', async ({ conversationId }) => {
      await ChatService.markAsRead(conversationId, userId);
      socket.to(`conversation:${conversationId}`).emit('message:read', {
        conversationId,
        userId,
        readAt: new Date(),
      });
    });

    socket.on('disconnect', async () => {
      const isCompletelyOffline = await SocketStore.removeSocket(userId, socket.id);
      if (isCompletelyOffline) {
        const now = new Date();
        await prisma.user
          .update({
            where: { id: userId },
            data: { isOnline: false, lastSeenAt: now },
          })
          .catch(() => {});

        io.emit('presence:offline', {
          userId,
          isOnline: false,
          lastSeenAt: now,
        });

        console.log(`[Socket] User offline: ${user.fullName} (${userId})`);
      }
    });
  });
}
