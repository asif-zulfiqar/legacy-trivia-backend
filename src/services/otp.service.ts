import { Otp } from '../models/Otp.js';
import { env } from '../config/env.js';
import { generateOtp, hashOtp, compareOtp } from '../utils/otp.js';
import { ApiError } from '../utils/ApiError.js';

const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

type OtpPurpose = 'email_verification' | 'password_reset' | 'login_verification';

export const issueOtp = async ({
  email,
  purpose,
}: {
  email: string;
  purpose: OtpPurpose;
}): Promise<string> => {
  const recent = await Otp.findOne({ email, purpose, consumed: false }).sort({
    createdAt: -1,
  });
  if (recent && recent.createdAt && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil(
      (RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime())) / 1000
    );
    throw ApiError.tooMany(`Please wait ${wait}s before requesting another code.`);
  }

  await Otp.updateMany({ email, purpose, consumed: false }, { $set: { consumed: true } });

  const otp = generateOtp(6);
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);
  await Otp.create({ email, otpHash, purpose, expiresAt });
  return otp;
};

export const verifyOtp = async ({
  email,
  otp,
  purpose,
}: {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}): Promise<boolean> => {
  const record = await Otp.findOne({ email, purpose, consumed: false }).sort({
    createdAt: -1,
  });
  if (!record) throw ApiError.badRequest('No active code. Please request a new one.');
  if (record.expiresAt < new Date()) {
    record.consumed = true;
    await record.save();
    throw ApiError.badRequest('Code has expired. Please request a new one.');
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    record.consumed = true;
    await record.save();
    throw ApiError.tooMany('Too many failed attempts. Please request a new code.');
  }

  const ok = await compareOtp(otp, record.otpHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest('Invalid verification code.');
  }

  record.consumed = true;
  await record.save();
  return true;
};
