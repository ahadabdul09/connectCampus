import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../utils/response.js';

export class AuthService {
  static async register(data) {
    const email = data.email.toLowerCase().trim();

    // Configurable email domain check
    if (ENV.COLLEGE_EMAIL_DOMAIN && ENV.COLLEGE_EMAIL_DOMAIN.length > 0) {
      const requiredDomain = `@${ENV.COLLEGE_EMAIL_DOMAIN}`;
      if (!email.endsWith(requiredDomain)) {
        throw new AppError(
          `Registration is restricted to college email addresses ending in ${requiredDomain}`,
          400
        );
      }
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new AppError('An account with this college email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Self-registration is always strictly STUDENT
    const user = await prisma.user.create({
      data: {
        fullName: data.fullName.trim(),
        email,
        passwordHash,
        departmentId: data.departmentId || null,
        batch: data.batch || null,
        studentId: data.studentId || null,
        role: 'STUDENT',
        isActive: true,
        isOnline: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        departmentId: true,
        batch: true,
        studentId: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  static async verifyInviteToken(token) {
    if (!token) {
      throw new AppError('Invitation token is required.', 400);
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        department: { select: { id: true, name: true, code: true } },
        invitedBy: { select: { fullName: true, role: true } },
      },
    });

    if (!invitation) {
      throw new AppError('Invitation not found or invalid.', 404);
    }

    if (invitation.acceptedAt) {
      throw new AppError('This invitation has already been accepted.', 400);
    }

    if (new Date() > invitation.expiresAt) {
      throw new AppError('This invitation link has expired. Please request a new invite from your campus administrator.', 410);
    }

    return {
      email: invitation.email,
      role: invitation.role,
      department: invitation.department,
      invitedBy: invitation.invitedBy?.fullName || 'Campus Administration',
    };
  }

  static async registerWithInvite(data) {
    const { token, fullName, password, studentId, batch } = data;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new AppError('Invalid invitation token.', 404);
    }

    if (invitation.acceptedAt) {
      throw new AppError('This invitation has already been used.', 400);
    }

    if (new Date() > invitation.expiresAt) {
      throw new AppError('This invitation has expired.', 410);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: invitation.email,
        passwordHash,
        role: invitation.role,
        departmentId: invitation.departmentId,
        studentId: studentId || null,
        batch: batch || null,
        isActive: true,
        isOnline: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        departmentId: true,
        batch: true,
        studentId: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  static async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid academic email or password.', 400);
    }

    if (user.isActive === false) {
      throw new AppError('Your campus account has been deactivated by administration. Please contact registrar.', 403);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid academic email or password.', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeenAt: new Date() },
    });

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    const { passwordHash: _, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new AppError('Session has expired. Please sign in again.', 401);
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const existing = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
      throw new AppError('Refresh token is invalid or has been revoked.', 401);
    }

    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        departmentId: true,
      },
    });

    if (!user) {
      throw new AppError('User account not found.', 404);
    }

    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const newRefreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(userId, refreshToken) {
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken
        .updateMany({
          where: { tokenHash, userId },
          data: { revokedAt: new Date() },
        })
        .catch(() => {});
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: false, lastSeenAt: new Date() },
    });

    return true;
  }

  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: {
          select: { id: true, name: true, code: true, headOfDepartment: true },
        },
        clubMembers: {
          include: {
            club: { select: { id: true, name: true, code: true, category: true } },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  static async updateProfile(userId, data) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName && { fullName: data.fullName.trim() }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.batch !== undefined && { batch: data.batch }),
        ...(data.studentId !== undefined && { studentId: data.studentId }),
      },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}
