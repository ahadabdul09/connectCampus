import { ChatService } from '../services/chatService.js';
import {
  createConversationSchema,
  sendMessageSchema,
  editMessageSchema,
  reactionSchema,
} from '../validators/chatValidator.js';
import { sendSuccess } from '../utils/response.js';

export class ChatController {
  static async getConversations(req, res, next) {
    try {
      const conversations = await ChatService.getConversations(req.user.id);
      sendSuccess(res, conversations);
    } catch (error) {
      next(error);
    }
  }

  static async getConversationDetails(req, res, next) {
    try {
      const details = await ChatService.getConversationDetails(req.params.id, req.user.id);
      sendSuccess(res, details);
    } catch (error) {
      next(error);
    }
  }

  static async createConversation(req, res, next) {
    try {
      const validated = createConversationSchema.parse(req.body);
      const conversation = await ChatService.createConversation(req.user.id, validated);
      sendSuccess(res, conversation, 'Conversation started.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMessages(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const cursor = req.query.cursor;
      const messages = await ChatService.getMessages(req.params.id, req.user.id, limit, cursor);
      sendSuccess(res, messages);
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req, res, next) {
    try {
      const validated = sendMessageSchema.parse(req.body);
      const message = await ChatService.sendMessage(req.params.id, req.user.id, validated);
      sendSuccess(res, message, 'Message sent.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async editMessage(req, res, next) {
    try {
      const { content } = editMessageSchema.parse(req.body);
      const updated = await ChatService.editMessage(req.params.id, req.user.id, content);
      sendSuccess(res, updated, 'Message edited.');
    } catch (error) {
      next(error);
    }
  }

  static async deleteMessage(req, res, next) {
    try {
      const result = await ChatService.deleteMessage(req.params.id, req.user.id, req.user.role);
      sendSuccess(res, result, 'Message deleted.');
    } catch (error) {
      next(error);
    }
  }

  static async togglePin(req, res, next) {
    try {
      const updated = await ChatService.togglePin(req.params.id, req.user.id);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  static async addReaction(req, res, next) {
    try {
      const { emoji } = reactionSchema.parse(req.body);
      const reaction = await ChatService.addReaction(req.params.id, req.user.id, emoji);
      sendSuccess(res, reaction, 'Reaction added.');
    } catch (error) {
      next(error);
    }
  }

  static async removeReaction(req, res, next) {
    try {
      const { emoji } = reactionSchema.parse(req.body);
      const result = await ChatService.removeReaction(req.params.id, req.user.id, emoji);
      sendSuccess(res, result, 'Reaction removed.');
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req, res, next) {
    try {
      await ChatService.markAsRead(req.params.id, req.user.id);
      sendSuccess(res, { read: true });
    } catch (error) {
      next(error);
    }
  }
}
