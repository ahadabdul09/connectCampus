import { redisClient } from '../config/redis.js';

export class SocketStore {
  static userSockets = new Map();

  static async registerSocket(userId, socketId) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socketId);
    await redisClient.sadd('online_users', userId);
  }

  static async removeSocket(userId, socketId) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
        await redisClient.srem('online_users', userId);
        return true;
      }
    }
    return false;
  }

  static isUserOnline(userId) {
    return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
  }

  static getOnlineUserIds() {
    return Array.from(this.userSockets.keys());
  }
}
