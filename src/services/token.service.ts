import crypto from 'crypto';
import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';
import { Types, type HydratedDocument } from 'mongoose';
import { env } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.js';
import type { IUser } from '../models/User.js';

const parseDurationToMs = (str: string | number): number => {
  const m = String(str).match(/^(\d+)\s*([smhd])$/i);
  if (!m) return Number(str) * 1000;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase() as 's' | 'm' | 'h' | 'd';
  const map: Record<'s' | 'm' | 'h' | 'd', number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return n * map[unit];
};

export const signAccessToken = (user: HydratedDocument<IUser>): string => {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn } as SignOptions
  );
};

export const verifyAccessToken = (token: string): JwtPayload & { sub: string; role: string } => {
  return jwt.verify(token, env.jwt.accessSecret) as JwtPayload & { sub: string; role: string };
};

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

interface IssueRefreshArgs {
  user: HydratedDocument<IUser>;
  userAgent?: string;
  ip?: string;
}

export const issueRefreshToken = async ({
  user,
  userAgent,
  ip,
}: IssueRefreshArgs): Promise<{ token: string; expiresAt: Date }> => {
  const raw = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.jwt.refreshExpiresIn));
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
    userAgent,
    ip,
  });
  return { token: raw, expiresAt };
};

export interface RotateRefreshResult {
  reused: boolean;
  token: string | null;
  expiresAt?: Date;
  userId?: Types.ObjectId;
}

export const rotateRefreshToken = async ({
  rawToken,
  userAgent,
  ip,
}: {
  rawToken: string;
  userAgent?: string;
  ip?: string;
}): Promise<RotateRefreshResult> => {
  const tokenHash = hashToken(rawToken);
  const existing = await RefreshToken.findOne({ tokenHash });
  if (!existing) return { reused: false, token: null };
  if (existing.revokedAt) {
    return { reused: true, token: null, userId: existing.user };
  }
  if (existing.expiresAt < new Date()) return { reused: false, token: null };

  const raw = crypto.randomBytes(48).toString('hex');
  const newHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.jwt.refreshExpiresIn));

  existing.revokedAt = new Date();
  existing.replacedByTokenHash = newHash;
  await existing.save();

  await RefreshToken.create({
    user: existing.user,
    tokenHash: newHash,
    expiresAt,
    userAgent,
    ip,
  });

  return { reused: false, token: raw, expiresAt, userId: existing.user };
};

export const revokeRefreshToken = async (rawToken: string): Promise<void> => {
  const tokenHash = hashToken(rawToken);
  await RefreshToken.updateOne(
    { tokenHash, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } }
  );
};

export const revokeAllUserRefreshTokens = async (
  userId: Types.ObjectId | string
): Promise<void> => {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } }
  );
};
