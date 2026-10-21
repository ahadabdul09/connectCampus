import { prisma } from '../config/prisma.js';

export class CommunityService {
  static async getDepartments() {
    return prisma.department.findMany({
      include: {
        _count: {
          select: { users: true, channels: true, announcements: true, resources: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getClubs(userId) {
    const clubs = await prisma.club.findMany({
      include: {
        lead: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        _count: {
          select: { members: true, events: true, resources: true },
        },
        members: userId
          ? {
              where: { userId },
              select: { role: true },
            }
          : false,
      },
      orderBy: { memberCount: 'desc' },
    });

    return clubs.map((club) => ({
      ...club,
      isJoined: userId ? club.members?.length > 0 : false,
      myRole: userId && club.members?.length > 0 ? club.members[0].role : null,
    }));
  }

  static async getClubDetails(clubId, userId) {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        lead: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatarUrl: true, role: true, batch: true },
            },
          },
          take: 20,
        },
        events: {
          orderBy: { eventDate: 'asc' },
          take: 5,
        },
        resources: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!club) {
      throw new Error('Club community not found.');
    }

    const isMember = userId
      ? club.members.some((m) => m.userId === userId)
      : false;

    return {
      ...club,
      isMember,
    };
  }

  static async joinClub(clubId, userId) {
    const existing = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: { clubId, userId },
      },
    });

    if (existing) {
      return existing;
    }

    const membership = await prisma.clubMember.create({
      data: {
        clubId,
        userId,
        role: 'MEMBER',
      },
    });

    await prisma.club.update({
      where: { id: clubId },
      data: { memberCount: { increment: 1 } },
    });

    return membership;
  }

  static async leaveClub(clubId, userId) {
    await prisma.clubMember.delete({
      where: {
        clubId_userId: { clubId, userId },
      },
    });

    await prisma.club.update({
      where: { id: clubId },
      data: { memberCount: { decrement: 1 } },
    });

    return { clubId, userId };
  }
}
