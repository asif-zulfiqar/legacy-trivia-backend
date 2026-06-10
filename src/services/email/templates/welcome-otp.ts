import { env } from '../../../config/env.js';
import {
  escapeHtml,
  renderBodyText,
  renderCallout,
  renderCta,
  renderDisplayHeading,
  renderGreeting,
  renderOtpDigits,
  wrapInLayout,
} from './layout.js';

export interface WelcomeOtpArgs {
  firstName: string;
  otp: string;
  expiresMinutes: number;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export const welcomeOtpTemplate = ({
  firstName,
  otp,
  expiresMinutes,
}: WelcomeOtpArgs): RenderedEmail => {
  const subject = `Welcome to ${env.brand.name} — verify your email`;
  const preheader = `Your verification code is ${otp}. Expires in ${expiresMinutes} minutes.`;

  const bodyHtml = `
${renderDisplayHeading(
  `Wel{{highlight}}come{{/highlight}} Back to ${escapeHtml(env.brand.name)}`,
)}
${renderBodyText(
  `Verify your login and continue your journey through exciting challenges, strategic gameplay, and exclusive rewards.`,
)}
${renderCta('Continue Playing', `${env.brand.appUrl}/login`)}
${renderGreeting(firstName)}
<p style="margin:0 0 6px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f1a3a;">
  Copy and paste this code into the app to access your account. For your security, this code will expire soon.
</p>
${renderOtpDigits(otp)}
${renderCallout(`If you didn't request this login, please secure your account immediately.`)}
`;

  const text = `Welcome back to ${env.brand.name}!

Hi ${firstName},

Use this verification code to access your account:

    ${otp}

This code expires in ${expiresMinutes} minutes. If you didn't request this login, please secure your account immediately.

— ${env.brand.name}`;

  return {
    subject,
    html: wrapInLayout({ preheader, bodyHtml }),
    text,
  };
};
