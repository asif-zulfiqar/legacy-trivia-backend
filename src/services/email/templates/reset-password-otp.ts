import { env } from '../../../config/env.js';
import {
  renderBodyText,
  renderCallout,
  renderCta,
  renderDisplayHeading,
  renderGreeting,
  renderOtpDigits,
  wrapInLayout,
  type LayoutArgs,
} from './layout.js';
import type { RenderedEmail } from './welcome-otp.js';

export interface ResetPasswordOtpArgs {
  firstName: string;
  otp: string;
  expiresMinutes: number;
}

const securityIcon = `
<div style="text-align:center;margin:6px 0 18px;">
  <span style="display:inline-block;font-size:64px;line-height:1;">🛡️</span>
</div>`;

export const resetPasswordOtpTemplate = ({
  firstName,
  otp,
  expiresMinutes,
}: ResetPasswordOtpArgs): RenderedEmail => {
  const subject = `Reset your ${env.brand.name} password`;
  const preheader = `Use code ${otp} to reset your password. Expires in ${expiresMinutes} minutes.`;

  const bodyHtml = `
${securityIcon}
${renderDisplayHeading(`Reset {{highlight}}Password{{/highlight}}`)}
${renderBodyText(`We received a request to reset your ${env.brand.name} password.`)}
${renderCta('Continue Playing', `${env.brand.appUrl}/login`)}
${renderGreeting(firstName)}
<p style="margin:0 0 6px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f1a3a;">
  You can copy and paste this code directly into the app to reset your password.
</p>
${renderOtpDigits(otp)}
${renderCallout(`If you didn't request this, you can safely ignore this email. Your account remains secure.`)}
`;

  const text = `Reset your ${env.brand.name} password

Hi ${firstName},

Use this code to reset your password:

    ${otp}

This code expires in ${expiresMinutes} minutes.

If you didn't request this, you can safely ignore this email — your account remains secure.

— ${env.brand.name}`;

  const layoutArgs: LayoutArgs = { preheader, bodyHtml };

  return {
    subject,
    html: wrapInLayout(layoutArgs),
    text,
  };
};
