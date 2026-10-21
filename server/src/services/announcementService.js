import { prisma } from '../config/prisma.js';

export class AnnouncementService {
  static async getAnnouncements(filters) {
    return prisma.announcement.findMany({
      where: {
        ...(filters?.departmentId && { departmentId: filters.departmentId }),
        ...(filters?.priority && { priority: filters.priority }),
      },
      include: {
        author: {
          select: { id: true, fullName: true, role: true, avatarUrl: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: filters?.limit || 50,
    });
  }

  static async createAnnouncement(authorId, data) {
    return prisma.announcement.create({
      data: {
        title: data.title.trim(),
        content: data.content.trim(),
        priority: data.priority || 'NORMAL',
        departmentId: data.departmentId || null,
        attachmentUrl: data.attachmentUrl || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        authorId,
      },
      include: {
        author: {
          select: { id: true, fullName: true, role: true, avatarUrl: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  static async deleteAnnouncement(id, userId, userRole) {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new Error('Announcement not found.');
    }

    if (announcement.authorId !== userId && userRole !== 'SUPER_ADMIN' && userRole !== 'DEPT_ADMIN') {
      throw new Error('You do not have permission to delete this announcement.');
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return { id };
  }
}
