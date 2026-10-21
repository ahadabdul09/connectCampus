import { NotificationService } from '../services/notificationService.js';
import { sendSuccess } from '../utils/response.js';

export class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const data = await NotificationService.getNotifications(req.user.id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req, res, next) {
    try {
      await NotificationService.markAsRead(req.params.id, req.user.id);
      sendSuccess(res, { read: true });
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user.id);
      sendSuccess(res, { allRead: true });
    } catch (error) {
      next(error);
    }
  }
}
