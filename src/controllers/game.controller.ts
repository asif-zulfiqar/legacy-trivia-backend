import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import { GameSession, type IGameSession, type ISessionQuestion } from '../models/GameSession.js';
import { Question, type IQuestion, type OptionKey } from '../models/Question.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created } from '../utils/ApiResponse.js';
import { secureShuffle } from '../utils/shuffle.js';
import {
  LEVEL_CONFIG,
  buildPrizeLadder,
  TIME_TOLERANCE_MS,
  type LevelKey,
  type LifelineType,
} from '../config/gameRules.js';

const ALL_KEYS: OptionKey[] = ['A', 'B', 'C', 'D'];

const buildLadder = (level: LevelKey): number[] => buildPrizeLadder(level);

type SessionDoc = HydratedDocument<IGameSession>;
type QuestionDoc = HydratedDocument<IQuestion>;

const serializeQuestionForClient = (
  sessionQ: ISessionQuestion,
  questionDoc: QuestionDoc,
  index: number
) => {
  const optionMap = new Map(questionDoc.options.map((o) => [o.key, o.text]));
  const orderedOptions = sessionQ.optionOrder.map((key) => ({
    key,
    text: optionMap.get(key as OptionKey),
  }));
  return {
    index,
    questionId: questionDoc._id,
    text: questionDoc.text,
    options: orderedOptions,
  };
};

const sessionPublicView = (session: SessionDoc, currentQuestionDoc: QuestionDoc | null) => {
  const ladder = buildLadder(session.level);
  return {
    sessionId: session._id,
    level: session.level,
    status: session.status,
    currentIndex: session.currentIndex,
    totalQuestions: session.questions.length,
    timerSeconds: session.timerSeconds,
    questionStartedAt: session.questionStartedAt,
    prizeWon: session.prizeWon,
    maxPrize: session.maxPrize,
    prizeLadder: ladder,
    lifelinesUsed: session.lifelinesUsed,
    empressGuardConsumed: session.empressGuardConsumed,
    currentQuestion:
      session.status === 'in_progress' && currentQuestionDoc
        ? serializeQuestionForClient(
            session.questions[session.currentIndex],
            currentQuestionDoc,
            session.currentIndex
          )
        : null,
  };
};

const loadCurrentQuestionDoc = async (session: SessionDoc): Promise<QuestionDoc | null> => {
  if (session.currentIndex >= session.questions.length) return null;
  const sq = session.questions[session.currentIndex];
  return Question.findById(sq.question);
};

const ensureLevelAccess = (user: { levelProgress?: { level1Completed?: boolean } }, level: LevelKey): void => {
  if (level === 2 && !user.levelProgress?.level1Completed) {
    throw ApiError.forbidden('Complete Level 1 before starting Level 2.');
  }
};

export const startGame = asyncHandler(async (req: Request, res: Response) => {
  const { level } = req.body as { level: LevelKey };
  const user = req.user;
  if (!user) throw ApiError.unauthorized();
  ensureLevelAccess(user, level);

  const cfg = LEVEL_CONFIG[level];

  const existing = await GameSession.findOne({
    user: user._id,
    level,
    status: 'in_progress',
  });
  if (existing) {
    const currentDoc = await loadCurrentQuestionDoc(existing);
    return success(
      res,
      sessionPublicView(existing, currentDoc),
      'Resumed in-progress session.'
    );
  }

  const difficulty = user.isTestAccount ? 'easy' : 'easy'; // MVP: keep all easy; expand later
  const pool = await Question.find({
    level,
    isActive: true,
    difficulty,
  }).select('_id');

  if (pool.length < cfg.questionCount) {
    throw ApiError.internal(
      `Not enough questions seeded for level ${level} (need ${cfg.questionCount}, have ${pool.length}).`
    );
  }

  const picked = secureShuffle(pool).slice(0, cfg.questionCount);
  const sessionQuestions = picked.map((q) => ({
    question: q._id,
    optionOrder: secureShuffle(ALL_KEYS),
  }));

  const session = await GameSession.create({
    user: user._id,
    level,
    questions: sessionQuestions,
    timerSeconds: cfg.timerSeconds,
    maxPrize: cfg.maxPrize,
    questionStartedAt: new Date(),
  });

  const currentDoc = await loadCurrentQuestionDoc(session);
  return created(res, sessionPublicView(session, currentDoc), 'Game started.');
});

export const getSession = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const session = await GameSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) throw ApiError.notFound('Session not found.');
  const currentDoc = await loadCurrentQuestionDoc(session);
  return success(res, sessionPublicView(session, currentDoc));
});

export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { sessionId, selectedOption } = req.body as { sessionId: string; selectedOption: OptionKey };
  const session = await GameSession.findOne({
    _id: sessionId,
    user: req.user._id,
  });
  if (!session) throw ApiError.notFound('Session not found.');
  if (session.status !== 'in_progress') {
    throw ApiError.badRequest('Session is not active.');
  }

  const sq = session.questions[session.currentIndex];
  if (sq.answeredOption) {
    throw ApiError.badRequest('Question already answered.');
  }
  if (!sq.optionOrder.includes(selectedOption)) {
    throw ApiError.badRequest('Invalid option for this question.');
  }

  const questionDoc = await Question.findById(sq.question);
  if (!questionDoc) throw ApiError.internal('Question not found.');

  const elapsedMs = Date.now() - new Date(session.questionStartedAt).getTime();
  const timedOut = elapsedMs > session.timerSeconds * 1000 + TIME_TOLERANCE_MS;

  const isCorrect = !timedOut && selectedOption === questionDoc.correctOption;

  sq.answeredOption = timedOut ? null : selectedOption;
  sq.isCorrect = isCorrect;
  sq.answeredAt = new Date();
  sq.timeTakenMs = elapsedMs;

  const ladder = buildLadder(session.level);
  let advanced = false;
  let safetyNetUsed = false;

  if (isCorrect) {
    session.prizeWon = ladder[session.currentIndex];
    session.currentIndex += 1;
    advanced = true;
    if (session.currentIndex >= session.questions.length) {
      session.status = 'won';
      session.endedAt = new Date();
    } else {
      session.questionStartedAt = new Date();
    }
  } else if (!session.empressGuardConsumed) {
    session.empressGuardConsumed = true;
    safetyNetUsed = true;
    sq.answeredOption = null;
    sq.isCorrect = null;
    sq.answeredAt = undefined;
    sq.timeTakenMs = undefined;
    session.questionStartedAt = new Date();
  } else {
    session.status = 'lost';
    session.endedAt = new Date();
    session.prizeWon = 0;
  }

  await session.save();

  if (session.status === 'won') {
    await User.updateOne(
      { _id: req.user._id },
      {
        $inc: { treasury: session.prizeWon },
        $set: {
          [`levelProgress.level${session.level}Completed`]: true,
          [`levelProgress.level${session.level}CompletedAt`]: new Date(),
          'levelProgress.highestLevelUnlocked': Math.max(
            req.user.levelProgress?.highestLevelUnlocked || 1,
            session.level + 1
          ),
        },
      }
    );
  }

  const currentDoc = await loadCurrentQuestionDoc(session);
  return success(res, {
    ...sessionPublicView(session, currentDoc),
    result: {
      isCorrect: timedOut ? false : isCorrect,
      timedOut,
      correctOption: session.status === 'in_progress' && advanced
        ? questionDoc.correctOption
        : !isCorrect && !safetyNetUsed
          ? questionDoc.correctOption
          : safetyNetUsed
            ? null
            : questionDoc.correctOption,
      safetyNetUsed,
      advanced,
    },
  });
});

export const useLifeline = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { sessionId, type } = req.body as { sessionId: string; type: string };
  const session = await GameSession.findOne({
    _id: sessionId,
    user: req.user._id,
  });
  if (!session) throw ApiError.notFound('Session not found.');
  if (session.status !== 'in_progress') {
    throw ApiError.badRequest('Session is not active.');
  }

  if (type === 'empress_guard') {
    throw ApiError.badRequest(
      'Empress\'s Guard is automatic — it activates on your first wrong answer.'
    );
  }

  const alreadyUsedThisQuestion = session.lifelinesUsed.some(
    (l) => l.questionIndex === session.currentIndex && l.type === type
  );
  if (alreadyUsedThisQuestion) {
    throw ApiError.badRequest('This lifeline was already used on this question.');
  }
  const alreadyUsedThisGame = session.lifelinesUsed.some((l) => l.type === type);
  if (alreadyUsedThisGame) {
    throw ApiError.badRequest('This lifeline has already been used in this game.');
  }

  const sq = session.questions[session.currentIndex];
  const questionDoc = await Question.findById(sq.question);
  if (!questionDoc) throw ApiError.internal('Question not found.');

  let payload: Record<string, unknown> = {};

  if (type === 'ask_a_friend') {
    const wrongs = sq.optionOrder.filter((k) => k !== questionDoc.correctOption);
    const eliminate = secureShuffle(wrongs).slice(0, 2);
    payload = { eliminate };
  } else if (type === 'the_reveal') {
    payload = { revealed: questionDoc.correctOption };
  } else if (type === 'ask_the_audience') {
    const correct = questionDoc.correctOption;
    const distribution: Record<string, number> = {};
    let remaining = 100;
    const correctPct = 55 + Math.floor(Math.random() * 25);
    distribution[correct] = correctPct;
    remaining -= correctPct;
    const others = sq.optionOrder.filter((k) => k !== correct);
    others.forEach((k, i) => {
      const pct = i === others.length - 1 ? remaining : Math.floor(Math.random() * remaining);
      distribution[k] = pct;
      remaining -= pct;
    });
    payload = { distribution };
  } else if (type === 'time_freeze') {
    session.questionStartedAt = new Date();
    payload = { timerResetAt: session.questionStartedAt };
  }

  session.lifelinesUsed.push({
    type: type as LifelineType,
    questionIndex: session.currentIndex,
    usedAt: new Date(),
  });

  await session.save();

  return success(res, {
    type,
    payload,
    lifelinesUsed: session.lifelinesUsed,
  });
});

export const cashOut = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { sessionId } = req.params;
  const session = await GameSession.findOne({
    _id: sessionId,
    user: req.user._id,
  });
  if (!session) throw ApiError.notFound('Session not found.');
  if (session.status !== 'in_progress') {
    throw ApiError.badRequest('Session is not active.');
  }

  session.status = 'cashed_out';
  session.endedAt = new Date();
  await session.save();

  if (session.prizeWon > 0) {
    await User.updateOne({ _id: req.user._id }, { $inc: { treasury: session.prizeWon } });
  }

  return success(res, sessionPublicView(session, null), 'Cashed out.');
});

export const abandon = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { sessionId } = req.params;
  const session = await GameSession.findOne({
    _id: sessionId,
    user: req.user._id,
  });
  if (!session) throw ApiError.notFound('Session not found.');
  if (session.status !== 'in_progress') {
    throw ApiError.badRequest('Session is not active.');
  }
  session.status = 'abandoned';
  session.endedAt = new Date();
  await session.save();
  return success(res, sessionPublicView(session, null), 'Session abandoned.');
});

export const getProgress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = req.user;
  const lp = user.levelProgress as unknown as Record<string, unknown>;
  return success(res, {
    treasury: user.treasury,
    levelProgress: user.levelProgress,
    levels: Object.values(LEVEL_CONFIG).map((c) => ({
      level: c.level,
      questionCount: c.questionCount,
      timerSeconds: c.timerSeconds,
      maxPrize: c.maxPrize,
      requiresLevel: c.requiresLevel,
      unlocked:
        c.level === 1 ||
        (c.requiresLevel && lp?.[`level${c.requiresLevel}Completed`]),
      completed: lp?.[`level${c.level}Completed`] || false,
      prizeLadder: buildPrizeLadder(c.level),
    })),
  });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const sessions = await GameSession.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('level status prizeWon maxPrize startedAt endedAt currentIndex');
  return success(res, { sessions });
});
