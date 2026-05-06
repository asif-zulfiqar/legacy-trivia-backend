import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ObjectSchema } from 'joi';
import { ApiError } from '../utils/ApiError.js';

export const validate =
  (schema: ObjectSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const data = {
      body: req.body,
      query: req.query,
      params: req.params,
    };
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: { objects: true },
    });
    if (error) {
      const details = Object.fromEntries(
        error.details.map((d) => [d.path.slice(1).join('.') || String(d.path[0]), d.message])
      );
      return next(ApiError.badRequest('Validation failed', details));
    }
    if (value.body) req.body = value.body;
    if (value.query) req.query = value.query;
    if (value.params) req.params = value.params;
    return next();
  };
