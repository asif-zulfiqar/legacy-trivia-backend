import type { Request, Response } from 'express';
import { LeaderboardEntry } from '../models/LeaderboardEntry.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/ApiResponse.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const requested = Number(req.query.limit);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const docs = await LeaderboardEntry.find()
    .sort({ score: -1 })
    .limit(limit)
    .lean();

  const entries = docs.map((doc, index) => ({
    rank: index + 1,
    name: doc.name,
    playerId: doc.playerId,
    score: doc.score,
    matches: doc.matches,
    winrate: doc.winrate,
    region: doc.region,
    avatarColor: doc.avatarColor,
  }));

  return success(res, { entries }, 'Leaderboard fetched.');
});
