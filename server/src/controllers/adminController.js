import { AdminService } from '../services/adminService.js';
import {
  inviteUserSchema,
  updateUserAdminSchema,
  departmentSchema,
  clubSchema,
} from '../validators/authValidator.js';
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
      const role = req.query.role;
      const departmentId = req.query.departmentId;
      const status = req.query.status;

      const result = await AdminService.getUsers({
        page,
        limit,
        search,
        role,
        departmentId,
        status,
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const validated = updateUserAdminSchema.parse(req.body);
      const result = await AdminService.updateUser(req.params.id, validated, req.user.id);
      sendSuccess(res, result, 'User profile and permissions updated.');
    } catch (error) {
      next(error);
    }
  }

  static async inviteUser(req, res, next) {
    try {
      const validated = inviteUserSchema.parse(req.body);
      const result = await AdminService.inviteUser({
        ...validated,
        invitedById: req.user.id,
      });
      sendSuccess(res, result, 'Invitation created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getInvitations(_req, res, next) {
    try {
      const result = await AdminService.getInvitations();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async revokeInvitation(req, res, next) {
    try {
      await AdminService.revokeInvitation(req.params.id);
      sendSuccess(res, null, 'Invitation revoked.');
    } catch (error) {
      next(error);
    }
  }

  static async createDepartment(req, res, next) {
    try {
      const validated = departmentSchema.parse(req.body);
      const result = await AdminService.createDepartment(validated);
      sendSuccess(res, result, 'Department created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDepartment(req, res, next) {
    try {
      await AdminService.deleteDepartment(req.params.id);
      sendSuccess(res, null, 'Department deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async createClub(req, res, next) {
    try {
      const validated = clubSchema.parse(req.body);
      const result = await AdminService.createClub(validated);
      sendSuccess(res, result, 'Club community created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteClub(req, res, next) {
    try {
      await AdminService.deleteClub(req.params.id);
      sendSuccess(res, null, 'Club community deleted.');
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
