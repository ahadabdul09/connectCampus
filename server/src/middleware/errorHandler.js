import { ZodError } from 'zod';
import { sendError, AppError } from '../utils/response.js';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return sendError(res, `Validation error: ${messages}`, 422);
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'Uploaded file exceeds the maximum allowed size limit (25 MB).', 413);
    }
    return sendError(res, `File upload error: ${err.message}`, 400);
  }

  if (err instanceof AppError || (err.statusCode && err.statusCode < 500)) {
    return sendError(res, err.message, err.statusCode || 400);
  }

  console.error('[Unhandled Error]', err);
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message || 'Internal server error occurred.'
      : 'An unexpected campus service error occurred. Please try again.';

  return sendError(res, message, err.statusCode || 500);
}

