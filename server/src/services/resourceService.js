import { prisma } from '../config/prisma.js';

export class ResourceService {
  static async getResources(params) {
    const where = {};

    if (params?.category && params.category !== 'ALL') {
      where.category = params.category;
    }

    if (params?.departmentId) {
      where.departmentId = params.departmentId;
    }

    if (params?.clubId) {
      where.clubId = params.clubId;
    }

    if (params?.search && params.search.trim().length > 0) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    const orderBy =
      params?.sortBy === 'downloads'
        ? { downloadsCount: 'desc' }
        : { createdAt: 'desc' };

    return prisma.resource.findMany({
      where,
      include: {
        uploader: {
          select: { id: true, fullName: true, role: true, avatarUrl: true },
        },
        department: { select: { id: true, name: true, code: true } },
        club: { select: { id: true, name: true, code: true } },
      },
      orderBy,
    });
  }

  static async createResource(uploaderId, data) {
    return prisma.resource.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        category: data.category || 'ACADEMICS',
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        departmentId: data.departmentId || null,
        clubId: data.clubId || null,
        tags: data.tags?.trim() || null,
        uploaderId,
      },
      include: {
        uploader: { select: { id: true, fullName: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  static async incrementDownload(resourceId) {
    return prisma.resource.update({
      where: { id: resourceId },
      data: { downloadsCount: { increment: 1 } },
      select: { id: true, downloadsCount: true },
    });
  }
}
