import { AnnouncementService } from '../services/announcementService.js';
import { createAnnouncementSchema } from '../validators/announcementValidator.js';
import { sendSuccess } from '../utils/response.js';

export class AnnouncementController {
  static async getAnnouncements(req, res, next) {
    try {
      const departmentId = req.query.departmentId;
      const priority = req.query.priority;
      const announcements = await AnnouncementService.getAnnouncements({ departmentId, priority });
      sendSuccess(res, announcements);
    } catch (error) {
      next(error);
    }
  }

  static async createAnnouncement(req, res, next) {
    try {
      const validated = createAnnouncementSchema.parse(req.body);
      const announcement = await AnnouncementService.createAnnouncement(req.user.id, validated);
      sendSuccess(res, announcement, 'Announcement published.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAnnouncement(req, res, next) {
    try {
      const result = await AnnouncementService.deleteAnnouncement(req.params.id, req.user.id, req.user.role);
      sendSuccess(res, result, 'Announcement deleted.');
    } catch (error) {
      next(error);
    }
  }
}
