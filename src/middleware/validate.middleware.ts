import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ObjectSchema } from 'joi';
import { ApiError } from '../utils/ApiError.js';

/**
 * Joi prepends our outer wrapper key (`body`, `query`, `params`) to every
 * error message — e.g. `"body.email" must be a valid email`. That's noise
 * for end users, so we strip the wrapper from both message text and path.
 */
const cleanFieldName = (name: string): string =>
  name.replace(/^(body|query|params)\./, '');

const cleanMessage = (raw: string): string =>
  raw.replace(/"(body|query|params)\.([^"]+)"/g, (_, _scope, field) => `"${field}"`);

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
      const details: Record<string, string> = {};
      for (const d of error.details) {
        const rawPath = d.path.slice(1).join('.') || String(d.path[0]);
        details[cleanFieldName(rawPath)] = cleanMessage(d.message);
      }
      // Surface the first specific error as the top-level message so the
      // client can show "Password must include uppercase characters." in a
      // toast instead of the generic "Validation failed".
      const first = error.details[0];
      const primary = first ? cleanMessage(first.message) : 'Invalid request.';
      return next(ApiError.badRequest(primary, details));
    }

    if (value.body) req.body = value.body;
    if (value.query) req.query = value.query;
    if (value.params) req.params = value.params;
    return next();
  };
