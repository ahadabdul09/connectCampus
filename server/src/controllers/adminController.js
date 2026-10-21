import { AdminService } from '../services/adminService.js';
import { sendSuccess } from '../utils/response.js';

export class AdminController {
  static async getStats(_req, res, next) {
    try {
      const stats = await AdminService.getPlatformStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const search = req.query.search;

      const result = await AdminService.getUsers(page, limit, search);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async resolveReport(req, res, next) {
    try {
      const { status, resolution } = req.body;
      const updated = await AdminService.resolveReport(req.params.id, status, resolution || '');
      sendSuccess(res, updated, 'Report status updated.');
    } catch (error) {
      next(error);
    }
  }
}
