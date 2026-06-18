import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { AccessCode } from '../models/AccessCode.js';
import { WaitlistEntry } from '../models/WaitlistEntry.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/ApiResponse.js';
import { createUniqueAccessCode } from '../services/accessCode.service.js';
import { sendAccessCodeEmail } from '../services/email/index.js';
import { env } from '../config/env.js';

const firstNameFrom = (fullName: string): string =>
  fullName.trim().split(/\s+/)[0] || 'Player';

const serializeEntry = (entry: {
  _id: Types.ObjectId;
  email: string;
  fullName: string;
  answers: unknown;
  status: string;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  accessCode?: unknown;
}) => ({
  id: entry._id,
  email: entry.email,
  fullName: entry.fullName,
  answers: entry.answers,
  status: entry.status,
  approvedAt: entry.approvedAt,
  createdAt: entry.createdAt,
  updatedAt: entry.updatedAt,
  accessCode: entry.accessCode,
});

export const listWaitlist = asyncHandler(async (req: Request, res: Response) => {
  const status = String(req.query.status || 'pending');
  const filter = status === 'all' ? {} : { status };

  const entries = await WaitlistEntry.find(filter)
    .sort({ createdAt: -1 })
    .populate('accessCode', 'code used usedAt')
    .lean();

  return success(res, { entries: entries.map(serializeEntry) });
});

export const approveWaitlistEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await WaitlistEntry.findById(req.params.id);
  if (!entry) throw ApiError.notFound('Waitlist entry not found.');

  let code = await AccessCode.findOne({
    email: entry.email,
    used: false,
  }).sort({ createdAt: -1 });

  if (!code) {
    code = await createUniqueAccessCode({
      email: entry.email,
      waitlistEntry: entry._id,
    });
  }

  entry.status = 'approved';
  entry.approvedAt = entry.approvedAt || new Date();
  entry.accessCode = code._id;
  await entry.save();

  const inviteUrl = `${env.brand.appUrl}/invite?code=${encodeURIComponent(
    code.code
  )}&email=${encodeURIComponent(entry.email)}`;

  await sendAccessCodeEmail({
    to: entry.email,
    firstName: firstNameFrom(entry.fullName),
    code: code.code,
    inviteUrl,
  });

  await code.populate('waitlistEntry', 'email fullName status');

  return success(
    res,
    {
      entry: serializeEntry({
        ...entry.toObject(),
        accessCode: {
          code: code.code,
          used: code.used,
          usedAt: code.usedAt,
        },
      }),
    },
    'Waitlist entry approved and access code sent.'
  );
});
