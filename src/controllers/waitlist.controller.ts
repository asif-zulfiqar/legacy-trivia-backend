import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import { WaitlistEntry, type IWaitlistEntry } from '../models/WaitlistEntry.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, success } from '../utils/ApiResponse.js';

const MOTIVATION_QUESTION =
  'What is your primary motivation for joining The Legacy Trivia?';

const serializeWaitlistEntry = (entry: HydratedDocument<IWaitlistEntry> | null) => {
  if (!entry) return null;
  return {
    id: entry._id,
    email: entry.email,
    fullName: entry.fullName,
    answers: entry.answers,
    status: entry.status,
    approvedAt: entry.approvedAt,
    createdAt: entry.createdAt,
  };
};

export const joinWaitlist = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };

  const entry = await WaitlistEntry.findOneAndUpdate(
    { email },
    {
      $setOnInsert: {
        email,
        status: 'pending',
      },
    },
    { new: true, upsert: true }
  );

  return success(res, { entry: serializeWaitlistEntry(entry) }, 'You are on the list.');
});

export const requestAccess = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    fullName,
    motivation,
  } = req.body as { email: string; fullName: string; motivation: string };

  const existed = await WaitlistEntry.exists({ email });
  const entry = await WaitlistEntry.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        fullName,
        answers: [{ question: MOTIVATION_QUESTION, answer: motivation }],
      },
      $setOnInsert: { status: 'pending' },
    },
    { new: true, upsert: true }
  );

  const payload = { entry: serializeWaitlistEntry(entry) };
  return existed
    ? success(res, payload, 'Application updated.')
    : created(res, payload, 'Application submitted.');
});
