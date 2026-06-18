import { Router, type Request, type Response } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import gameRoutes from './game.routes.js';
import leaderboardRoutes from './leaderboard.routes.js';
import waitlistRoutes from './waitlist.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (_req: Request, res: Response) =>
  res.json({ success: true, message: 'OK', uptime: process.uptime() })
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/game', gameRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/admin', adminRoutes);

export default router;
