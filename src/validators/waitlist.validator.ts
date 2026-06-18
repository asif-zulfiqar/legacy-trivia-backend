import Joi from 'joi';

const emailRule = Joi.string().email().lowercase().trim().required();

export const joinWaitlistSchema = Joi.object({
  body: Joi.object({
    email: emailRule,
  }),
});

export const requestAccessSchema = Joi.object({
  body: Joi.object({
    email: emailRule,
    fullName: Joi.string().trim().min(1).max(100).required(),
    motivation: Joi.string()
      .valid('Intellectual Challenge', 'Financial Opportunity', 'Competition')
      .required(),
  }),
});
