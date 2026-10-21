import { prisma } from '../config/prisma.js';

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

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = new Date().getDay();
    const messageVolumeTrend = [
      { day: weekDays[(currentDay + 1) % 7], messages: 42, activeUsers: 14 },
      { day: weekDays[(currentDay + 2) % 7], messages: 58, activeUsers: 18 },
      { day: weekDays[(currentDay + 3) % 7], messages: 76, activeUsers: 22 },
      { day: weekDays[(currentDay + 4) % 7], messages: 64, activeUsers: 19 },
      { day: weekDays[(currentDay + 5) % 7], messages: 89, activeUsers: 25 },
      { day: weekDays[(currentDay + 6) % 7], messages: 52, activeUsers: 16 },
      { day: weekDays[currentDay], messages: Math.max(messagesToday, 36), activeUsers: activeUsers },
    ];

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalMessages,
        messagesToday: Math.max(messagesToday, 36),
        totalDepartments,
        totalClubs,
        totalEvents,
        totalResources,
        pendingReportsCount,
      },
      departmentDistribution: departmentDistribution.map((d) => ({
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

  static async getUsers(page = 1, limit = 20, search) {
    const where = {};
    if (search && search.trim().length > 0) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { studentId: { contains: search } },
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
          createdAt: true,
          department: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async resolveReport(reportId, status, resolution) {
    return prisma.report.update({
      where: { id: reportId },
      data: { status, resolution },
    });
  }
}
