import { env } from '../../config/env.js';
import { sendEmail } from './sender.js';
import { welcomeOtpTemplate } from './templates/welcome-otp.js';
import { resetPasswordOtpTemplate } from './templates/reset-password-otp.js';
import { congratsTemplate } from './templates/congrats.js';
import { achievementTemplate } from './templates/achievement.js';

export { sendEmail } from './sender.js';

interface SendWelcomeOtpArgs {
  to: string;
  firstName: string;
  otp: string;
}

export const sendWelcomeOtpEmail = async ({
  to,
  firstName,
  otp,
}: SendWelcomeOtpArgs) => {
  const { subject, html, text } = welcomeOtpTemplate({
    firstName,
    otp,
    expiresMinutes: env.otpExpiryMinutes,
  });
  return sendEmail({ to, subject, html, text });
};

interface SendResetPasswordOtpArgs {
  to: string;
  firstName: string;
  otp: string;
}

export const sendResetPasswordOtpEmail = async ({
  to,
  firstName,
  otp,
}: SendResetPasswordOtpArgs) => {
  const { subject, html, text } = resetPasswordOtpTemplate({
    firstName,
    otp,
    expiresMinutes: env.otpExpiryMinutes,
  });
  return sendEmail({ to, subject, html, text });
};

interface SendCongratsArgs {
  to: string;
  firstName: string;
  prize: number;
  phaseName?: string;
}

export const sendCongratsEmail = async ({
  to,
  firstName,
  prize,
  phaseName,
}: SendCongratsArgs) => {
  const { subject, html, text } = congratsTemplate({
    firstName,
    prize,
    phaseName,
  });
  return sendEmail({ to, subject, html, text });
};

interface SendAchievementArgs {
  to: string;
  firstName: string;
  levelName: string;
  treasury: number;
}

export const sendAchievementEmail = async ({
  to,
  firstName,
  levelName,
  treasury,
}: SendAchievementArgs) => {
  const { subject, html, text } = achievementTemplate({
    firstName,
    levelName,
    treasury,
  });
  return sendEmail({ to, subject, html, text });
};

/**
 * Backward-compatible facade for the previous OTP API. Routes to the new
 * Welcome / Reset templates based on purpose. `firstName` is optional —
 * falls back to a polite generic greeting when callers haven't been
 * migrated to pass it.
 */
interface SendOtpEmailLegacyArgs {
  to: string;
  otp: string;
  purpose: 'email_verification' | 'password_reset';
  firstName?: string;
}

export const sendOtpEmail = async ({
  to,
  otp,
  purpose,
  firstName,
}: SendOtpEmailLegacyArgs) => {
  const safeName = firstName?.trim() || 'Player';
  if (purpose === 'password_reset') {
    return sendResetPasswordOtpEmail({ to, otp, firstName: safeName });
  }
  return sendWelcomeOtpEmail({ to, otp, firstName: safeName });
};
