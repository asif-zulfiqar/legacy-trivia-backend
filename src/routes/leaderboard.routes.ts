import { Router } from 'express';
import * as ctrl from '../controllers/leaderboard.controller.js';

const router = Router();

// Public — also rendered on the onboarding tutorial and (later) the landing page.
router.get('/', ctrl.getLeaderboard);

export default router;
