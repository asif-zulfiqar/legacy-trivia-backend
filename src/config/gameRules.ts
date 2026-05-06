export type LevelKey = 1 | 2;

export interface LevelConfig {
  level: LevelKey;
  questionCount: number;
  timerSeconds: number;
  maxPrize: number;
  requiresLevel: LevelKey | null;
  lifelinesFree: boolean;
}

export const LEVEL_CONFIG: Record<LevelKey, LevelConfig> = {
  1: {
    level: 1,
    questionCount: 15,
    timerSeconds: 35,
    maxPrize: 15,
    requiresLevel: null,
    lifelinesFree: true,
  },
  2: {
    level: 2,
    questionCount: 20,
    timerSeconds: 15,
    maxPrize: 200,
    requiresLevel: 1,
    lifelinesFree: false,
  },
};

export const LIFELINE_TYPES = [
  'ask_a_friend',
  'ask_the_audience',
  'the_reveal',
  'time_freeze',
  'empress_guard',
] as const;

export type LifelineType = (typeof LIFELINE_TYPES)[number];

export const buildPrizeLadder = (level: LevelKey): number[] => {
  const cfg = LEVEL_CONFIG[level];
  if (!cfg) return [];
  const step = cfg.maxPrize / cfg.questionCount;
  return Array.from({ length: cfg.questionCount }, (_, i) =>
    Number(((i + 1) * step).toFixed(2))
  );
};

export const TIME_TOLERANCE_MS = 2000;
