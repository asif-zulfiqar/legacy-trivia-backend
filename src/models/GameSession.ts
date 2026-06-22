import mongoose, { Schema, Types } from 'mongoose';
import type { OptionKey } from './Question.js';
import type { LifelineCostSource, LifelineType } from '../config/gameRules.js';

export interface ISessionQuestion {
  question: Types.ObjectId;
  optionOrder: string[];
  answeredOption?: OptionKey | null;
  isCorrect?: boolean | null;
  answeredAt?: Date;
  timeTakenMs?: number;
  timeBonusSeconds?: number;
}

export interface ILifelineUsage {
  type: LifelineType;
  questionIndex: number;
  usedAt: Date;
  costAmount?: number;
  costCurrency?: 'USD' | 'GEMS';
  costSource?: LifelineCostSource;
  payload?: Record<string, unknown>;
}

export type GameSessionStatus =
  | 'in_progress'
  | 'won'
  | 'lost'
  | 'cashed_out'
  | 'abandoned';

export interface IGameSession {
  user: Types.ObjectId;
  level: 1 | 2;
  questions: ISessionQuestion[];
  currentIndex: number;
  lifelinesUsed: ILifelineUsage[];
  potentialPrizePenalty: number;
  empressGuardConsumed: boolean;
  status: GameSessionStatus;
  timerSeconds: number;
  questionStartedAt: Date;
  prizeWon: number;
  maxPrize: number;
  startedAt: Date;
  endedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const sessionQuestionSchema = new Schema<ISessionQuestion>(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    optionOrder: {
      type: [String],
      validate: (v: unknown) => Array.isArray(v) && v.length === 4,
    },
    answeredOption: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
    isCorrect: { type: Boolean, default: null },
    answeredAt: { type: Date },
    timeTakenMs: { type: Number },
    timeBonusSeconds: { type: Number, default: 0 },
  },
  { _id: false }
);

const lifelineUsageSchema = new Schema<ILifelineUsage>(
  {
    type: {
      type: String,
      enum: ['ask_a_friend', 'ask_the_audience', 'the_reveal', 'time_freeze', 'empress_guard'],
      required: true,
    },
    questionIndex: { type: Number, required: true },
    usedAt: { type: Date, default: Date.now },
    costAmount: { type: Number, default: 0 },
    costCurrency: { type: String, enum: ['USD', 'GEMS'] },
    costSource: {
      type: String,
      enum: ['potential_winnings', 'treasury', 'free'],
      default: 'free',
    },
    payload: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const gameSessionSchema = new Schema<IGameSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    level: { type: Number, enum: [1, 2], required: true },

    questions: { type: [sessionQuestionSchema], required: true },
    currentIndex: { type: Number, default: 0 },

    lifelinesUsed: { type: [lifelineUsageSchema], default: [] },
    potentialPrizePenalty: { type: Number, default: 0 },
    empressGuardConsumed: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['in_progress', 'won', 'lost', 'cashed_out', 'abandoned'],
      default: 'in_progress',
      index: true,
    },

    timerSeconds: { type: Number, required: true },
    questionStartedAt: { type: Date, default: Date.now },

    prizeWon: { type: Number, default: 0 },
    maxPrize: { type: Number, required: true },

    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

gameSessionSchema.index({ user: 1, status: 1 });

export const GameSession = mongoose.model<IGameSession>('GameSession', gameSessionSchema);
