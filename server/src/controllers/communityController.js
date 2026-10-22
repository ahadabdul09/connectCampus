import { CommunityService } from '../services/communityService.js';
import { AdminService } from '../services/adminService.js';
import { clubSchema } from '../validators/authValidator.js';
import { sendSuccess } from '../utils/response.js';

export class CommunityController {
  static async getDepartments(_req, res, next) {
    try {
      const departments = await CommunityService.getDepartments();
      sendSuccess(res, departments);
    } catch (error) {
      next(error);
    }
  }

  static async getClubs(req, res, next) {
    try {
      const clubs = await CommunityService.getClubs(req.user?.id);
      sendSuccess(res, clubs);
    } catch (error) {
      next(error);
    }
  }

  static async getClubDetails(req, res, next) {
    try {
      const details = await CommunityService.getClubDetails(req.params.id, req.user?.id);
      sendSuccess(res, details);
    } catch (error) {
      next(error);
    }
  }

  static async joinClub(req, res, next) {
    try {
      const membership = await CommunityService.joinClub(req.params.id, req.user.id);
      sendSuccess(res, membership, 'Joined club successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async leaveClub(req, res, next) {
    try {
      const result = await CommunityService.leaveClub(req.params.id, req.user.id);
      sendSuccess(res, result, 'Left club.');
    } catch (error) {
      next(error);
    }
  }

  static async createClub(req, res, next) {
    try {
      const validated = clubSchema.parse(req.body);
      const club = await AdminService.createClub({
        ...validated,
        leadId: validated.leadId || req.user.id,
      });
      sendSuccess(res, club, 'Club created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }
}
