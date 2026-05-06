import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(50),
    lastName: Joi.string().trim().min(1).max(50),
    profilePicture: Joi.string().uri().allow(''),
    soundOn: Joi.boolean(),
    btcAddress: Joi.string().trim().max(120).allow(''),
  }).min(1),
});

export const changePasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(/[A-Z]/)
      .pattern(/[a-z]/)
      .pattern(/\d/)
      .required(),
    confirmPassword: Joi.any()
      .equal(Joi.ref('newPassword'))
      .required()
      .messages({ 'any.only': 'Passwords do not match.' }),
  }),
});
