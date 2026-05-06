import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimit.middleware.js';
import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  refreshSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), ctrl.signup);
router.post('/verify-email', authLimiter, validate(verifyOtpSchema), ctrl.verifyEmailOtp);
router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), ctrl.resendOtp);

router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/google', authLimiter, validate(googleAuthSchema), ctrl.googleAuth);

router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post('/verify-reset-otp', authLimiter, validate(verifyResetOtpSchema), ctrl.verifyResetOtp);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), ctrl.resetPassword);

router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/logout', ctrl.logout);

router.get('/me', authenticate, ctrl.me);

export default router;
