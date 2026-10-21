export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export function sendSuccess(res, data, message, statusCode = 200) {
  const payload = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(payload);
}

export function sendError(res, error, statusCode = 400) {
  const payload = {
    success: false,
    error,
  };
  return res.status(statusCode).json(payload);
}

