import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { isProd } from '../config/env.js';

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let error: ApiError;

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, (v as { message: string }).message])
    );
    error = ApiError.badRequest('Validation failed', details);
  } else if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  } else if (err && typeof err === 'object' && (err as { code?: number }).code === 11000) {
    const fields = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue || {});
    error = ApiError.conflict(`Duplicate value for: ${fields.join(', ')}`);
  } else if (err instanceof jwt.TokenExpiredError) {
    error = ApiError.unauthorized('Token expired');
  } else if (err instanceof jwt.JsonWebTokenError) {
    error = ApiError.unauthorized('Invalid token');
  } else if (err instanceof ApiError) {
    error = err;
  } else {
    const msg = (err as { message?: string })?.message || 'Internal server error';
    error = ApiError.internal(msg);
  }

  const status = error.statusCode || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
    ...(isProd ? {} : { stack: (err as { stack?: string })?.stack }),
  });
};
