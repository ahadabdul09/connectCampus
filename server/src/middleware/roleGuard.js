import { sendError } from '../utils/response.js';

export function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before accessing this resource.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access restricted. Your account role (${req.user.role}) is not authorized for this operation.`,
        403
      );
    }

    next();
  };
}
