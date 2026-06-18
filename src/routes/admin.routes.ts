import { Router } from 'express';
import * as ctrl from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  waitlistParamSchema,
  waitlistQuerySchema,
} from '../validators/admin.validator.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/waitlist', validate(waitlistQuerySchema), ctrl.listWaitlist);
router.post(
  '/waitlist/:id/approve',
  validate(waitlistParamSchema),
  ctrl.approveWaitlistEntry
);

export default router;
