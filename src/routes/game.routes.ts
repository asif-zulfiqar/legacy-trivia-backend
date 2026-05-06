import { Router } from 'express';
import * as ctrl from '../controllers/game.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  startGameSchema,
  answerSchema,
  lifelineSchema,
  sessionParamSchema,
} from '../validators/game.validator.js';

const router = Router();

router.use(authenticate);

router.get('/progress', ctrl.getProgress);
router.get('/history', ctrl.getHistory);

router.post('/start', validate(startGameSchema), ctrl.startGame);
router.get('/session/:sessionId', validate(sessionParamSchema), ctrl.getSession);
router.post('/answer', validate(answerSchema), ctrl.submitAnswer);
router.post('/lifeline', validate(lifelineSchema), ctrl.useLifeline);
router.post('/session/:sessionId/cashout', validate(sessionParamSchema), ctrl.cashOut);
router.post('/session/:sessionId/abandon', validate(sessionParamSchema), ctrl.abandon);

export default router;
