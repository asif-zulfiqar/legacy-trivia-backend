import Joi from 'joi';

const objectId = Joi.string().hex().length(24);

export const waitlistQuerySchema = Joi.object({
  query: Joi.object({
    status: Joi.string().valid('pending', 'approved', 'all').default('pending'),
  }),
});

export const waitlistParamSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
  }),
});

export const userListQuerySchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    role: Joi.string().valid('all', 'user', 'admin').default('all'),
    approved: Joi.string().valid('all', 'true', 'false').default('all'),
    search: Joi.string().allow('').max(100).default(''),
  }),
});

export const userParamSchema = Joi.object({
  params: Joi.object({
    id: objectId.required(),
  }),
});
