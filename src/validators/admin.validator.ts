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
