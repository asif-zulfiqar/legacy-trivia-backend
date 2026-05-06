import type { Response } from 'express';

export const success = <T>(
  res: Response,
  data: T | null = null,
  message = 'Success',
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const created = <T>(res: Response, data: T, message = 'Created'): Response =>
  success(res, data, message, 201);
