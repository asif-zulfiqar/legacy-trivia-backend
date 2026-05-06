import { Router, type Request, type Response } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import gameRoutes from './game.routes.js';

const router = Router();

router.get('/health', (_req: Request, res: Response) =>
  res.json({ success: true, message: 'OK', uptime: process.uptime() })
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/game', gameRoutes);

export default router;
