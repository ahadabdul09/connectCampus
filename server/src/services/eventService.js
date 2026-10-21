import { prisma } from '../config/prisma.js';

export class EventService {
  static async getEvents(userId, filters) {
    const events = await prisma.event.findMany({
      where: {
        ...(filters?.departmentId && { departmentId: filters.departmentId }),
        ...(filters?.clubId && { clubId: filters.clubId }),
      },
      include: {
        organizer: {
          select: { id: true, fullName: true, role: true, avatarUrl: true },
        },
        department: { select: { id: true, name: true, code: true } },
        club: { select: { id: true, name: true, code: true } },
        registrations: userId
          ? {
              where: { userId },
              select: { status: true, registeredAt: true },
            }
          : false,
      },
      orderBy: { eventDate: 'asc' },
    });

    return events.map((event) => {
      const reg = userId && event.registrations?.length > 0 ? event.registrations[0] : null;
      return {
        ...event,
        isRegistered: reg ? reg.status === 'REGISTERED' : false,
        registrationStatus: reg ? reg.status : null,
      };
    });
  }

  static async createEvent(organizerId, data) {
    return prisma.event.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        location: data.location.trim(),
        eventDate: new Date(data.eventDate),
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
        maxCapacity: data.maxCapacity || 100,
        departmentId: data.departmentId || null,
        clubId: data.clubId || null,
        bannerUrl: data.bannerUrl || null,
        organizerId,
      },
      include: {
        organizer: { select: { id: true, fullName: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
        club: { select: { id: true, name: true, code: true } },
      },
    });
  }

  static async registerForEvent(eventId, userId) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found.');
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new Error('Event registration deadline has passed.');
    }

    if (event.registeredCount >= event.maxCapacity) {
      throw new Error('Event is at maximum capacity.');
    }

    const registration = await prisma.eventRegistration.upsert({
      where: {
        eventId_userId: { eventId, userId },
      },
      create: {
        eventId,
        userId,
        status: 'REGISTERED',
      },
      update: {
        status: 'REGISTERED',
        registeredAt: new Date(),
      },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { registeredCount: { increment: 1 } },
    });

    return registration;
  }

  static async cancelRegistration(eventId, userId) {
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (!registration || registration.status !== 'REGISTERED') {
      throw new Error('You are not currently registered for this event.');
    }

    await prisma.eventRegistration.update({
      where: {
        eventId_userId: { eventId, userId },
      },
      data: { status: 'CANCELLED' },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { registeredCount: { decrement: 1 } },
    });

    return { eventId, userId, status: 'CANCELLED' };
  }
}
