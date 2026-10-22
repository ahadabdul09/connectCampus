import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { sendError } from '../utils/response.js';

export async function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token missing or invalid format.', 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return sendError(res, 'Session token has expired or is invalid. Please sign in again.', 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        departmentId: true,
        isActive: true,
      },
    });

    if (!user) {
      return sendError(res, 'User account no longer exists.', 401);
    }

    if (user.isActive === false) {
      return sendError(res, 'This campus account has been deactivated by administration.', 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      departmentId: user.departmentId,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    return sendError(res, 'Internal authentication error.', 500);
  }
}
