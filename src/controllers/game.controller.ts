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
  REGULAR_LIFELINE_TYPES,
  buildPrizeLadder,
  TIME_TOLERANCE_MS,
  type LifelineCost,
  type LevelKey,
  type LifelineType,
  type RegularLifelineType,
} from '../config/gameRules.js';
import {
  sendCongratsEmail,
  sendAchievementEmail,
} from '../services/email/index.js';

const LEVEL_DISPLAY_NAMES: Record<number, string> = {
  1: 'The First Date',
  2: 'The Commitment',
};

const levelDisplayName = (level: number): string =>
  LEVEL_DISPLAY_NAMES[level] || `Level ${level}`;

const ALL_KEYS: OptionKey[] = ['A', 'B', 'C', 'D'];

const buildLadder = (level: LevelKey): number[] => buildPrizeLadder(level);

const LIFELINE_COPY: Record<RegularLifelineType, { label: string; effect: string }> = {
  ask_a_friend: {
    label: 'Ask a Friend',
    effect: 'Removes two incorrect answers.',
  },
  ask_the_audience: {
    label: 'Ask the Audience',
    effect: 'Returns an audience poll with weighted guesses.',
  },
  the_reveal: {
    label: 'The Reveal',
    effect: 'Reveals the correct answer for a brief moment.',
  },
  time_freeze: {
    label: 'Time Freeze',
    effect: 'Adds 15 seconds to the current question timer.',
  },
};

type SessionDoc = HydratedDocument<IGameSession>;
type QuestionDoc = HydratedDocument<IQuestion>;
type UserDoc = NonNullable<Request['user']>;

const difficultyForUser = (user: UserDoc): 'easy' | 'normal' =>
  user.isTestAccount || user.role === 'admin' ? 'easy' : 'normal';

const findQuestionPool = async (
  level: LevelKey,
  difficulty: 'easy' | 'normal',
  count: number,
  excludeIds: unknown[] = []
) => {
  const filter = {
    level,
    isActive: true,
    _id: { $nin: excludeIds },
  };
  const primary = await Question.find({ ...filter, difficulty }).select('_id');
  if (primary.length >= count || difficulty === 'easy') return primary;
  return Question.find(filter).select('_id');
};

const currentSessionQuestion = (session: SessionDoc): ISessionQuestion | null =>
  session.questions[session.currentIndex] || null;

const questionTimeBonus = (session: SessionDoc): number =>
  currentSessionQuestion(session)?.timeBonusSeconds || 0;

const totalTimerSeconds = (session: SessionDoc): number =>
  session.timerSeconds + questionTimeBonus(session);

const timerEndsAt = (session: SessionDoc): Date =>
  new Date(
    new Date(session.questionStartedAt).getTime() + totalTimerSeconds(session) * 1000
  );

const effectivePrizeForIndex = (session: SessionDoc, index: number): number => {
  const ladder = buildLadder(session.level);
  const base = ladder[index] || 0;
  if (session.level !== 1) return base;
  return Math.max(0, Number((base - (session.potentialPrizePenalty || 0)).toFixed(2)));
};

const lifelineCostFor = (level: LevelKey): LifelineCost => LEVEL_CONFIG[level].lifelineCost;

const buildLifelineStates = (session: SessionDoc, user: UserDoc) => {
  const cost = lifelineCostFor(session.level);
  const hasTreasury =
    cost.source !== 'treasury' || (user.treasury || 0) >= cost.amount;

  const regular = REGULAR_LIFELINE_TYPES.map((type) => {
    const used = session.lifelinesUsed.some((l) => l.type === type);
    const disabledReason = used
      ? 'already_used'
      : !hasTreasury
        ? 'insufficient_treasury'
        : null;

    return {
      type,
      label: LIFELINE_COPY[type].label,
      effect: LIFELINE_COPY[type].effect,
      used,
      available: session.status === 'in_progress' && !disabledReason,
      disabledReason,
      cost,
    };
  });

  return {
    regular,
    empressGuard: {
      type: 'empress_guard' as const,
      label: "Empress's Guard",
      effect:
        'Automatic one-time safety net. On the first wrong answer, it keeps the player alive and refreshes the question timer.',
      automatic: true,
      used: session.empressGuardConsumed,
      available: session.status === 'in_progress' && !session.empressGuardConsumed,
      cost: {
        amount: 0,
        currency: 'GEMS' as const,
        source: 'free' as const,
      },
    },
  };
};

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

const sessionPublicView = (
  session: SessionDoc,
  currentQuestionDoc: QuestionDoc | null,
  user: UserDoc
) => {
  const ladder = buildLadder(session.level);
  return {
    sessionId: session._id,
    level: session.level,
    status: session.status,
    currentIndex: session.currentIndex,
    totalQuestions: session.questions.length,
    timerSeconds: session.timerSeconds,
    timeBonusSeconds: questionTimeBonus(session),
    totalTimerSeconds: totalTimerSeconds(session),
    questionStartedAt: session.questionStartedAt,
    timerEndsAt: timerEndsAt(session),
    prizeWon: session.prizeWon,
    potentialPrizePenalty: session.potentialPrizePenalty || 0,
    currentPotentialPrize:
      session.status === 'in_progress'
        ? effectivePrizeForIndex(session, session.currentIndex)
        : session.prizeWon,
    maxPrize: session.maxPrize,
    prizeLadder: ladder,
    lifelinesUsed: session.lifelinesUsed,
    lifelines: buildLifelineStates(session, user),
    empressGuardConsumed: session.empressGuardConsumed,
    treasury: user.treasury,
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

const refreshCurrentQuestionAfterGuard = async (
  session: SessionDoc,
  user: UserDoc
): Promise<boolean> => {
  const sq = currentSessionQuestion(session);
  if (!sq) return false;

  sq.answeredOption = null;
  sq.isCorrect = null;
  sq.answeredAt = undefined;
  sq.timeTakenMs = undefined;
  sq.timeBonusSeconds = 0;

  const excludeIds = session.questions.map((q) => q.question);
  const pool = await findQuestionPool(
    session.level,
    difficultyForUser(user),
    1,
    excludeIds
  );
  const replacement = secureShuffle(pool)[0];
  if (!replacement) return false;

  sq.question = replacement._id;
  sq.optionOrder = secureShuffle(ALL_KEYS);
  return true;
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
      sessionPublicView(existing, currentDoc, user),
      'Resumed in-progress session.'
    );
  }

  const difficulty = difficultyForUser(user);
  const pool = await findQuestionPool(level, difficulty, cfg.questionCount);

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
  return created(res, sessionPublicView(session, currentDoc, user), 'Game started.');
});

export const getSession = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const session = await GameSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) throw ApiError.notFound('Session not found.');
  const currentDoc = await loadCurrentQuestionDoc(session);
  return success(res, sessionPublicView(session, currentDoc, req.user));
});

export const getRules = asyncHandler(async (_req: Request, res: Response) => {
  return success(res, {
    levels: Object.values(LEVEL_CONFIG).map((cfg) => ({
      level: cfg.level,
      questionCount: cfg.questionCount,
      timerSeconds: cfg.timerSeconds,
      maxPrize: cfg.maxPrize,
      requiresLevel: cfg.requiresLevel,
      prizeLadder: buildPrizeLadder(cfg.level),
      lifelineCost: cfg.lifelineCost,
      timeFreezeSeconds: cfg.timeFreezeSeconds,
    })),
    lifelines: REGULAR_LIFELINE_TYPES.map((type) => ({
      type,
      label: LIFELINE_COPY[type].label,
      effect: LIFELINE_COPY[type].effect,
      oncePerLevel: true,
    })),
    empressGuard: {
      type: 'empress_guard',
      label: "Empress's Guard",
      automatic: true,
      oncePerLevel: true,
      cost: {
        amount: 0,
        currency: 'GEMS',
        source: 'free',
      },
    },
  });
});

export const getLifelines = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const session = await GameSession.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) throw ApiError.notFound('Session not found.');
  return success(res, {
    sessionId: session._id,
    level: session.level,
    lifelinesUsed: session.lifelinesUsed,
    lifelines: buildLifelineStates(session, req.user),
    potentialPrizePenalty: session.potentialPrizePenalty || 0,
    treasury: req.user.treasury,
  });
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
  const timedOut = elapsedMs > totalTimerSeconds(session) * 1000 + TIME_TOLERANCE_MS;

  const isCorrect = !timedOut && selectedOption === questionDoc.correctOption;

  sq.answeredOption = timedOut ? null : selectedOption;
  sq.isCorrect = isCorrect;
  sq.answeredAt = new Date();
  sq.timeTakenMs = elapsedMs;

  let advanced = false;
  let safetyNetUsed = false;
  let guardRefreshedQuestion = false;

  if (isCorrect) {
    session.prizeWon = effectivePrizeForIndex(session, session.currentIndex);
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
    guardRefreshedQuestion = await refreshCurrentQuestionAfterGuard(session, req.user);
    session.questionStartedAt = new Date();
  } else {
    session.status = 'lost';
    session.endedAt = new Date();
    session.prizeWon = 0;
  }

  await session.save();

  if (session.status === 'won') {
    // Capture prior completion state BEFORE the update so we can detect
    // the first-time win for this level and send the celebration email
    // exactly once per user per level.
    const lp = req.user.levelProgress as
      | { level1Completed?: boolean; level2Completed?: boolean }
      | undefined;
    const wasLevel1Done = !!lp?.level1Completed;
    const wasLevel2Done = !!lp?.level2Completed;
    const priorTreasury = req.user.treasury || 0;

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
    req.user.treasury = priorTreasury + session.prizeWon;

    // Fire-and-forget celebration email. Wrapped so an SMTP failure
    // never breaks the game response.
    const firstTimeWin =
      (session.level === 1 && !wasLevel1Done) ||
      (session.level === 2 && !wasLevel2Done);

    if (firstTimeWin && req.user.email) {
      const newTreasury = priorTreasury + session.prizeWon;
      const userInfo = {
        to: req.user.email,
        firstName: req.user.firstName || 'Player',
      };
      const sendPromise =
        session.level === 1
          ? sendCongratsEmail({
              ...userInfo,
              prize: session.prizeWon,
              phaseName: levelDisplayName(1),
            })
          : sendAchievementEmail({
              ...userInfo,
              levelName: levelDisplayName(session.level),
              treasury: newTreasury,
            });
      sendPromise.catch((err) =>
        console.error('[email] level-win send failed:', err)
      );
    }
  }

  const currentDoc = await loadCurrentQuestionDoc(session);
  return success(res, {
    ...sessionPublicView(session, currentDoc, req.user),
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
      guardRefreshedQuestion,
      advanced,
    },
  });
});

export const useLifeline = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { sessionId, type } = req.body as { sessionId: string; type: string };
  const lifelineType = type as LifelineType;
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
    (l) => l.questionIndex === session.currentIndex && l.type === lifelineType
  );
  if (alreadyUsedThisQuestion) {
    throw ApiError.badRequest('This lifeline was already used on this question.');
  }
  const alreadyUsedThisGame = session.lifelinesUsed.some((l) => l.type === lifelineType);
  if (alreadyUsedThisGame) {
    throw ApiError.badRequest('This lifeline has already been used in this level.');
  }

  const sq = session.questions[session.currentIndex];
  if (!sq) throw ApiError.badRequest('No active question for this session.');
  const questionDoc = await Question.findById(sq.question);
  if (!questionDoc) throw ApiError.internal('Question not found.');

  const cfg = LEVEL_CONFIG[session.level];
  const cost = cfg.lifelineCost;

  if (cost.source === 'treasury') {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id, treasury: { $gte: cost.amount } },
      { $inc: { treasury: -cost.amount } },
      { new: true }
    );
    if (!updatedUser) {
      throw ApiError.badRequest(
        `You need ${cost.amount} Gems in your Treasury to use this lifeline.`
      );
    }
    req.user.treasury = updatedUser.treasury;
  } else if (cost.source === 'potential_winnings') {
    session.potentialPrizePenalty = Number(
      ((session.potentialPrizePenalty || 0) + cost.amount).toFixed(2)
    );
  }

  let payload: Record<string, unknown> = {};

  if (type === 'ask_a_friend') {
    const wrongs = sq.optionOrder.filter((k) => k !== questionDoc.correctOption);
    const eliminate = secureShuffle(wrongs).slice(0, 2);
    payload = { eliminate, removedOptions: eliminate };
  } else if (type === 'the_reveal') {
    payload = {
      revealed: questionDoc.correctOption,
      correctOption: questionDoc.correctOption,
    };
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
    sq.timeBonusSeconds = (sq.timeBonusSeconds || 0) + cfg.timeFreezeSeconds;
    payload = {
      timerExtendedBySeconds: cfg.timeFreezeSeconds,
      timeBonusSeconds: sq.timeBonusSeconds,
      timerEndsAt: timerEndsAt(session),
      totalTimerSeconds: totalTimerSeconds(session),
    };
  }

  session.lifelinesUsed.push({
    type: lifelineType,
    questionIndex: session.currentIndex,
    usedAt: new Date(),
    costAmount: cost.amount,
    costCurrency: cost.currency,
    costSource: cost.source,
    payload,
  });

  await session.save();
  const currentDoc = await loadCurrentQuestionDoc(session);

  return success(res, {
    type,
    payload,
    lifelinesUsed: session.lifelinesUsed,
    session: sessionPublicView(session, currentDoc, req.user),
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
    req.user.treasury = (req.user.treasury || 0) + session.prizeWon;
  }

  return success(res, sessionPublicView(session, null, req.user), 'Cashed out.');
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
  return success(res, sessionPublicView(session, null, req.user), 'Session abandoned.');
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
      lifelineCost: c.lifelineCost,
      timeFreezeSeconds: c.timeFreezeSeconds,
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
