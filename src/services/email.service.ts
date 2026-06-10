/**
 * Backward-compatible re-export. The email implementation now lives in
 * `services/email/`. Older imports of `email.service.js` keep working.
 *
 * Prefer importing the named senders directly:
 *   import {
 *     sendWelcomeOtpEmail,
 *     sendResetPasswordOtpEmail,
 *     sendCongratsEmail,
 *     sendAchievementEmail,
 *   } from './email/index.js';
 */
export {
  sendEmail,
  sendOtpEmail,
  sendWelcomeOtpEmail,
  sendResetPasswordOtpEmail,
  sendCongratsEmail,
  sendAchievementEmail,
} from './email/index.js';
