export class ApiError extends Error {
  statusCode: number;
  details?: unknown;
  isOperational: boolean;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }
  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }
  static notFound(message = 'Not found'): ApiError {
    return new ApiError(404, message);
  }
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }
  static tooMany(message = 'Too many requests'): ApiError {
    return new ApiError(429, message);
  }
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message);
  }
}
