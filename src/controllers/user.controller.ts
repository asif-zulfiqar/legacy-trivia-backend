import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/ApiResponse.js';
import { revokeAllUserRefreshTokens } from '../services/token.service.js';

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
  return success(res, { user }, 'Profile updated.');
});

export const completeOnboarding = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { onboardingCompleted: true } },
    { new: true }
  );
  return success(res, { user }, 'Onboarding completed.');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw ApiError.unauthorized();
  if (!user.password) {
    throw ApiError.badRequest(
      'This account uses Google Sign-In. Use forgot-password to set a password.'
    );
  }
  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.unauthorized('Current password is incorrect.');

  user.password = newPassword;
  await user.save();
  await revokeAllUserRefreshTokens(user._id);

  return success(res, null, 'Password updated. Please sign in again.');
});
