import { AuthService } from '../services/authService.js';
import { updateProfileSchema } from '../validators/authValidator.js';
import { sendSuccess } from '../utils/response.js';
import { prisma } from '../config/prisma.js';

export class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user.id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updated = await AuthService.updateProfile(req.user.id, validated);
      sendSuccess(res, updated, 'Profile updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const targetUser = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          batch: true,
          studentId: true,
          bio: true,
          avatarUrl: true,
          isOnline: true,
          lastSeenAt: true,
          department: { select: { id: true, name: true, code: true } },
          clubMembers: {
            include: { club: { select: { id: true, name: true, code: true } } },
          },
        },
      });

      if (!targetUser) {
        throw new Error('User not found.');
      }

      sendSuccess(res, targetUser);
    } catch (error) {
      next(error);
    }
  }

  static async listCampusUsers(req, res, next) {
    try {
      const { departmentId, search } = req.query;
      const where = {
        id: { not: req.user.id },
        isActive: true,
      };

      if (departmentId) {
        where.departmentId = departmentId;
      }

      if (search && search.trim()) {
        const q = search.trim();
        where.OR = [
          { fullName: { contains: q } },
          { email: { contains: q } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          batch: true,
          avatarUrl: true,
          isOnline: true,
          department: { select: { id: true, code: true, name: true } },
        },
        take: 30,
        orderBy: { fullName: 'asc' },
      });

      sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }
}
