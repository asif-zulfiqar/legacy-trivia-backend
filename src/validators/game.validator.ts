import Joi from 'joi';
import { LIFELINE_TYPES } from '../config/gameRules.js';

const objectId = Joi.string().hex().length(24);

export const startGameSchema = Joi.object({
  body: Joi.object({
    level: Joi.number().valid(1, 2).required(),
  }),
});

export const answerSchema = Joi.object({
  body: Joi.object({
    sessionId: objectId.required(),
    selectedOption: Joi.string().valid('A', 'B', 'C', 'D').required(),
  }),
});

export const lifelineSchema = Joi.object({
  body: Joi.object({
    sessionId: objectId.required(),
    type: Joi.string().valid(...LIFELINE_TYPES).required(),
  }),
});

export const sessionParamSchema = Joi.object({
  params: Joi.object({
    sessionId: objectId.required(),
  }),
});
