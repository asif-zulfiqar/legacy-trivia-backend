import Joi from 'joi';

const passwordRule = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/\d/, 'digit')
  .messages({
    'string.pattern.name':
      'Password must include {#name} characters.',
    'string.min': 'Password must be at least 8 characters.',
  });

const emailRule = Joi.string().email().lowercase().trim().required();

export const signupSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName: Joi.string().trim().min(1).max(50).required(),
    email: emailRule,
    password: passwordRule.required(),
    referralCode: Joi.string().trim().optional().allow(''),
  }),
});

export const verifyOtpSchema = Joi.object({
  body: Joi.object({
    email: emailRule,
    otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
  }),
});

export const resendOtpSchema = Joi.object({
  body: Joi.object({
    email: emailRule,
    purpose: Joi.string().valid('email_verification', 'password_reset').required(),
  }),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: emailRule,
    password: Joi.string().required(),
  }),
});

export const googleAuthSchema = Joi.object({
  body: Joi.object({
    idToken: Joi.string().required(),
    referralCode: Joi.string().trim().optional().allow(''),
  }),
});

export const forgotPasswordSchema = Joi.object({
  body: Joi.object({
    email: emailRule,
  }),
});

export const verifyResetOtpSchema = Joi.object({
  body: Joi.object({
    email: emailRule,
    otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
  }),
});

export const resetPasswordSchema = Joi.object({
  body: Joi.object({
    resetToken: Joi.string().required(),
    newPassword: passwordRule.required(),
    // confirmPassword is a UI-only concern — the client is responsible for
    // checking the two fields match before submitting. Accepted but ignored.
    confirmPassword: Joi.string().optional(),
  }),
});

export const refreshSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
});
