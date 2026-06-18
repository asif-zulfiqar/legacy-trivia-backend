import { Router } from 'express';
import * as ctrl from '../controllers/waitlist.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { otpLimiter } from '../middleware/rateLimit.middleware.js';
import {
  joinWaitlistSchema,
  requestAccessSchema,
} from '../validators/waitlist.validator.js';

const router = Router();

router.post('/join', otpLimiter, validate(joinWaitlistSchema), ctrl.joinWaitlist);
router.post('/request-access', otpLimiter, validate(requestAccessSchema), ctrl.requestAccess);

export default router;
