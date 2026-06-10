import crypto from 'crypto';
import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import { User, type IUser, type IUserMethods } from '../models/User.js';
import { PasswordResetSession } from '../models/PasswordResetSession.js';
import { issueOtp, verifyOtp } from '../services/otp.service.js';
import {
  sendWelcomeOtpEmail,
  sendResetPasswordOtpEmail,
} from '../services/email/index.js';
import { verifyGoogleIdToken } from '../services/google.service.js';
import {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from '../services/token.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created } from '../utils/ApiResponse.js';

type UserDoc = HydratedDocument<IUser, IUserMethods>;

const sanitizeUser = (user: UserDoc) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  profilePicture: user.profilePicture,
  authProvider: user.authProvider,
  isVerified: user.isVerified,
  role: user.role,
  onboardingCompleted: user.onboardingCompleted,
  treasury: user.treasury,
  levelProgress: user.levelProgress,
  soundOn: user.soundOn,
  btcAddress: user.btcAddress,
});

const issueAuthTokens = async (user: UserDoc, req: Request) => {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, expiresAt } = await issueRefreshToken({
    user,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  return {
    accessToken,
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
};

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, referralCode } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.isVerified) throw ApiError.conflict('Email already registered.');
    existing.firstName = firstName;
    existing.lastName = lastName;
    existing.password = password;
    if (referralCode) existing.referralCode = referralCode;
    await existing.save();
  } else {
    await User.create({
      firstName,
      lastName,
      email,
      password,
      referralCode,
      authProvider: 'local',
    });
  }

  const otp = await issueOtp({ email, purpose: 'email_verification' });
  await sendWelcomeOtpEmail({ to: email, firstName, otp });

  return created(res, { email }, 'Verification code sent to your email.');
});

export const verifyEmailOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw ApiError.badRequest('Account not found.');

  await verifyOtp({ email, otp, purpose: 'email_verification' });

  user.isVerified = true;
  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueAuthTokens(user, req);
  return success(res, { user: sanitizeUser(user), ...tokens }, 'Email verified.');
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, purpose } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw ApiError.badRequest('Account not found.');
  if (purpose === 'email_verification' && user.isVerified) {
    throw ApiError.badRequest('Email is already verified.');
  }

  const otp = await issueOtp({ email, purpose });
  if (purpose === 'password_reset') {
    await sendResetPasswordOtpEmail({ to: email, firstName: user.firstName, otp });
  } else {
    await sendWelcomeOtpEmail({ to: email, firstName: user.firstName, otp });
  }
  return success(res, { email }, 'Verification code sent.');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password.');
  if (user.authProvider === 'google' && !user.password) {
    throw ApiError.badRequest(
      'This account uses Google Sign-In. Please continue with Google.'
    );
  }
  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid email or password.');

  if (!user.isVerified) {
    const otp = await issueOtp({ email, purpose: 'email_verification' });
    await sendWelcomeOtpEmail({ to: email, firstName: user.firstName, otp });
    return success(
      res,
      { email, requiresVerification: true },
      'Please verify your email. A new code has been sent.',
      403
    );
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueAuthTokens(user, req);
  return success(res, { user: sanitizeUser(user), ...tokens }, 'Logged in.');
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { idToken, referralCode } = req.body;
  const profile = await verifyGoogleIdToken(idToken);

  let user = await User.findOne({ email: profile.email });
  if (!user) {
    user = await User.create({
      firstName: profile.firstName || 'User',
      lastName: profile.lastName || '',
      email: profile.email,
      googleId: profile.googleId,
      authProvider: 'google',
      profilePicture: profile.picture,
      isVerified: true,
      referralCode,
    });
  } else {
    let dirty = false;
    if (!user.googleId) {
      user.googleId = profile.googleId;
      dirty = true;
    }
    if (!user.isVerified) {
      user.isVerified = true;
      dirty = true;
    }
    if (!user.profilePicture && profile.picture) {
      user.profilePicture = profile.picture;
      dirty = true;
    }
    if (dirty) await user.save();
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueAuthTokens(user, req);
  return success(res, { user: sanitizeUser(user), ...tokens }, 'Logged in with Google.');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Always return success-like response to avoid email enumeration.
  if (user && user.authProvider === 'local') {
    const otp = await issueOtp({ email, purpose: 'password_reset' });
    await sendResetPasswordOtpEmail({ to: email, firstName: user.firstName, otp });
  }
  return success(
    res,
    { email },
    'If an account exists for this email, a reset code has been sent.'
  );
});

export const verifyResetOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.authProvider !== 'local') {
    throw ApiError.badRequest('Invalid request.');
  }
  await verifyOtp({ email, otp, purpose: 'password_reset' });

  const raw = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  await PasswordResetSession.create({
    email,
    tokenHash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  return success(res, { resetToken: raw }, 'Code verified. You may now reset your password.');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const session = await PasswordResetSession.findOne({ tokenHash, consumed: false });
  if (!session || session.expiresAt < new Date()) {
    throw ApiError.badRequest('Reset session expired. Please request a new code.');
  }
  const user = await User.findOne({ email: session.email }).select('+password');
  if (!user) throw ApiError.badRequest('Account not found.');

  user.password = newPassword;
  await user.save();

  session.consumed = true;
  await session.save();

  await revokeAllUserRefreshTokens(user._id);

  return success(res, null, 'Password updated. Please sign in again.');
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await rotateRefreshToken({
    rawToken: refreshToken,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });

  if (result.reused && result.userId) {
    await revokeAllUserRefreshTokens(result.userId);
    throw ApiError.unauthorized('Refresh token reuse detected. Please sign in again.');
  }
  if (!result.token) throw ApiError.unauthorized('Invalid or expired refresh token.');

  const user = await User.findById(result.userId);
  if (!user) throw ApiError.unauthorized('User not found.');

  const accessToken = signAccessToken(user);
  return success(res, {
    accessToken,
    refreshToken: result.token,
    refreshTokenExpiresAt: result.expiresAt,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) await revokeRefreshToken(refreshToken);
  return success(res, null, 'Logged out.');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  return success(res, { user: sanitizeUser(req.user) });
});
