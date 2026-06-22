import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { AccessCode } from '../models/AccessCode.js';
import { GameSession } from '../models/GameSession.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { User } from '../models/User.js';
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

const serializeUser = (user: {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  authProvider: string;
  isVerified: boolean;
  role: string;
  approved: boolean;
  onboardingCompleted: boolean;
  treasury: number;
  btcAddress?: string;
  soundOn: boolean;
  levelProgress?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  authProvider: user.authProvider,
  isVerified: user.isVerified,
  role: user.role,
  approved: user.approved,
  onboardingCompleted: user.onboardingCompleted,
  treasury: user.treasury,
  btcAddress: user.btcAddress,
  soundOn: user.soundOn,
  levelProgress: user.levelProgress,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLoginAt: user.lastLoginAt,
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

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 50), 100);
  const skip = (page - 1) * limit;
  const role = String(req.query.role || 'all');
  const approved = String(req.query.approved || 'all');
  const search = String(req.query.search || '').trim();

  const filter: Record<string, unknown> = {};
  if (role !== 'all') filter.role = role;
  if (approved !== 'all') filter.approved = approved === 'true';
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { firstName: rx },
      { lastName: rx },
      { email: rx },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return success(res, {
    users: users.map(serializeUser),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const removeUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot remove your own admin account.');
  }

  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found.');
  if (user.role === 'admin') {
    throw ApiError.badRequest('Admin accounts cannot be removed from this panel.');
  }

  await Promise.all([
    User.deleteOne({ _id: user._id }),
    RefreshToken.deleteMany({ user: user._id }),
    GameSession.deleteMany({ user: user._id }),
  ]);

  return success(
    res,
    { deletedUserId: user._id },
    'User removed successfully.'
  );
});
