import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { AppError } from '../utils/response.js';

export class AdminService {
  static async getPlatformStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      totalMessages,
      messagesToday,
      totalDepartments,
      totalClubs,
      totalEvents,
      totalResources,
      pendingReportsCount,
      departmentDistribution,
      recentUsers,
      recentReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isOnline: true } }),
      prisma.message.count(),
      prisma.message.count({ where: { createdAt: { gte: today } } }),
      prisma.department.count(),
      prisma.club.count(),
      prisma.event.count(),
      prisma.resource.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.department.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          _count: { select: { users: true, resources: true, announcements: true } },
        },
      }),
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          batch: true,
          isOnline: true,
          isActive: true,
          createdAt: true,
          department: { select: { code: true } },
        },
      }),
      prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { fullName: true, email: true } },
        },
      }),
    ]);

    // Calculate REAL 7-day trend from actual database messages
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const messageVolumeTrend = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const [count, activeCount] = await Promise.all([
        prisma.message.count({
          where: { createdAt: { gte: dayStart, lte: dayEnd } },
        }),
        prisma.user.count({
          where: { lastSeenAt: { gte: dayStart, lte: dayEnd } },
        }),
      ]);

      messageVolumeTrend.push({
        day: weekDays[dayStart.getDay()],
        date: dayStart.toISOString().slice(0, 10),
        messages: count,
        activeUsers: activeCount,
      });
    }

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalMessages,
        messagesToday,
        totalDepartments,
        totalClubs,
        totalEvents,
        totalResources,
        pendingReportsCount,
      },
      departmentDistribution: departmentDistribution.map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        userCount: d._count.users,
        resourceCount: d._count.resources,
      })),
      messageVolumeTrend,
      recentUsers,
      recentReports,
    };
  }

  static async getUsers(options = {}) {
    const { page = 1, limit = 20, search, role, departmentId, status } = options;

    const where = {};

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId;
    }

    if (status && status !== 'ALL') {
      where.isActive = status === 'ACTIVE';
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { studentId: { contains: q } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          studentId: true,
          batch: true,
          isOnline: true,
          isActive: true,
          createdAt: true,
          department: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async updateUser(userId, data, currentAdminId) {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new AppError('User not found.', 404);
    }

    if (existing.id === currentAdminId && data.isActive === false) {
      throw new AppError('Administrators cannot deactivate their own account.', 400);
    }

    const updateData = {};
    if (data.role) updateData.role = data.role;
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId || null;
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  static async inviteUser({ email, role, departmentId, invitedById }) {
    const cleanEmail = email.toLowerCase().trim();

    if (ENV.COLLEGE_EMAIL_DOMAIN && ENV.COLLEGE_EMAIL_DOMAIN.length > 0) {
      const requiredDomain = `@${ENV.COLLEGE_EMAIL_DOMAIN}`;
      if (!cleanEmail.endsWith(requiredDomain)) {
        throw new AppError(
          `Invitations can only be dispatched to official college emails ending in ${requiredDomain}`,
          400
        );
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      throw new AppError('An enrolled user with this academic email already exists.', 400);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days

    const invitation = await prisma.invitation.upsert({
      where: { email: cleanEmail },
      create: {
        email: cleanEmail,
        role,
        departmentId: departmentId || null,
        token,
        expiresAt,
        invitedById,
      },
      update: {
        role,
        departmentId: departmentId || null,
        token,
        expiresAt,
        acceptedAt: null,
        invitedById,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });

    const inviteUrl = `/register?token=${token}`;

    return {
      invitation,
      token,
      inviteUrl,
    };
  }

  static async getInvitations() {
    return prisma.invitation.findMany({
      where: { acceptedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { id: true, name: true, code: true } },
        invitedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  static async revokeInvitation(invitationId) {
    return prisma.invitation.delete({
      where: { id: invitationId },
    });
  }

  static async createDepartment(data) {
    const existingCode = await prisma.department.findUnique({
      where: { code: data.code.trim().toUpperCase() },
    });

    if (existingCode) {
      throw new AppError(`A department with code ${data.code} already exists.`, 409);
    }

    return prisma.department.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        description: data.description?.trim() || null,
        headOfDepartment: data.headOfDepartment?.trim() || null,
      },
    });
  }

  static async deleteDepartment(departmentId) {
    const usersCount = await prisma.user.count({
      where: { departmentId },
    });

    if (usersCount > 0) {
      throw new AppError(
        `Cannot delete department: ${usersCount} users are currently enrolled. Reassign them first.`,
        400
      );
    }

    return prisma.department.delete({
      where: { id: departmentId },
    });
  }

  static async createClub(data) {
    const existing = await prisma.club.findFirst({
      where: {
        OR: [{ name: data.name.trim() }, { code: data.code.trim().toUpperCase() }],
      },
    });

    if (existing) {
      throw new AppError('A club with this name or code already exists.', 409);
    }

    return prisma.club.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        description: data.description.trim(),
        category: data.category || 'TECHNICAL',
        leadId: data.leadId || null,
        bannerUrl: data.bannerUrl || null,
      },
    });
  }

  static async deleteClub(clubId) {
    return prisma.club.delete({
      where: { id: clubId },
    });
  }

  static async resolveReport(reportId, status, resolution) {
    return prisma.report.update({
      where: { id: reportId },
      data: { status, resolution },
    });
  }
}
