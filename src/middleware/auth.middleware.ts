import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyAccessToken } from '../services/token.service.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or invalid Authorization header.');
  }
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.sub);
  if (!user) throw ApiError.unauthorized('User not found.');
  if (!user.isVerified) throw ApiError.forbidden('Email not verified.');
  req.user = user;
  next();
});

export const requireRole =
  (...roles: string[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    return next();
  };
