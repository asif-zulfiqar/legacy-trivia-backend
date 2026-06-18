import crypto from 'crypto';
import { LoginVerificationSession } from '../models/LoginVerificationSession.js';
import { ApiError } from '../utils/ApiError.js';

const LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export const createLoginChallenge = async (email: string): Promise<string> => {
  await LoginVerificationSession.updateMany(
    { email, consumed: false },
    { $set: { consumed: true } }
  );

  const raw = crypto.randomBytes(32).toString('hex');
  await LoginVerificationSession.create({
    email,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + LOGIN_CHALLENGE_TTL_MS),
  });
  return raw;
};

export const assertLoginChallenge = async ({
  email,
  loginToken,
}: {
  email: string;
  loginToken: string;
}) => {
  const session = await LoginVerificationSession.findOne({
    email,
    tokenHash: hashToken(loginToken),
    consumed: false,
  });

  if (!session || session.expiresAt < new Date()) {
    throw ApiError.badRequest('Login verification expired. Please sign in again.');
  }

  return session;
};

export const consumeLoginChallenge = async ({
  email,
  loginToken,
}: {
  email: string;
  loginToken: string;
}): Promise<void> => {
  const session = await assertLoginChallenge({ email, loginToken });
  session.consumed = true;
  await session.save();
};
