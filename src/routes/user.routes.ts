import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.patch('/me', validate(updateProfileSchema), ctrl.updateProfile);
router.post('/complete-onboarding', ctrl.completeOnboarding);
router.post('/change-password', validate(changePasswordSchema), ctrl.changePassword);

export default router;
