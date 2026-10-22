import { sendError } from '../utils/response.js';

export function roleGuard(...allowedRoles) {
  const expanded = new Set(allowedRoles);
  if (expanded.has('DEPT_ADMIN')) expanded.add('DEPARTMENT_ADMIN');
  if (expanded.has('DEPARTMENT_ADMIN')) expanded.add('DEPT_ADMIN');

  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before accessing this resource.', 401);
    }

    if (!expanded.has(req.user.role)) {
      return sendError(
        res,
        `Access restricted. Your account role (${req.user.role}) is not authorized for this operation.`,
        403
      );
    }

    next();
  };
}
