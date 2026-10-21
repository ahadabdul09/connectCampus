import { prisma } from '../config/prisma.js';

export class SearchService {
  static async globalSearch(query, userId) {
    const q = query.trim();
    if (!q || q.length < 2) {
      return {
        people: [],
        messages: [],
        communities: [],
        announcements: [],
        events: [],
        resources: [],
        totalResults: 0,
      };
    }

    const [people, messages, clubs, departments, announcements, events, resources] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { fullName: { contains: q } },
            { email: { contains: q } },
            { studentId: { contains: q } },
            { bio: { contains: q } },
          ],
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          batch: true,
          avatarUrl: true,
          isOnline: true,
          department: { select: { name: true, code: true } },
        },
        take: 6,
      }),

      prisma.message.findMany({
        where: {
          content: { contains: q },
          conversation: {
            members: { some: { userId } },
          },
        },
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
          conversation: { select: { id: true, title: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),

      prisma.club.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { code: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          code: true,
          category: true,
          description: true,
          memberCount: true,
        },
        take: 4,
      }),

      prisma.department.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { code: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
        },
        take: 4,
      }),

      prisma.announcement.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
          ],
        },
        include: {
          department: { select: { name: true, code: true } },
          author: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),

      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { location: { contains: q } },
          ],
        },
        include: {
          department: { select: { name: true, code: true } },
          club: { select: { name: true, code: true } },
        },
        orderBy: { eventDate: 'asc' },
        take: 6,
      }),

      prisma.resource.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        include: {
          department: { select: { name: true, code: true } },
          uploader: { select: { fullName: true } },
        },
        orderBy: { downloadsCount: 'desc' },
        take: 6,
      }),
    ]);

    const formattedCommunities = [
      ...departments.map((d) => ({
        id: d.id,
        title: d.name,
        code: d.code,
        type: 'DEPARTMENT',
        description: d.description,
      })),
      ...clubs.map((c) => ({
        id: c.id,
        title: c.name,
        code: c.code,
        type: 'CLUB',
        category: c.category,
        description: c.description,
        memberCount: c.memberCount,
      })),
    ];

    const totalResults =
      people.length +
      messages.length +
      formattedCommunities.length +
      announcements.length +
      events.length +
      resources.length;

    return {
      people,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        senderName: m.sender.fullName,
        conversationId: m.conversation.id,
        conversationTitle: m.conversation.title || 'Direct Conversation',
      })),
      communities: formattedCommunities,
      announcements,
      events,
      resources,
      totalResults,
    };
  }
}
