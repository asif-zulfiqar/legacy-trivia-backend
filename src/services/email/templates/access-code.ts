import { env } from '../../../config/env.js';
import {
  escapeHtml,
  renderBodyText,
  renderCallout,
  renderCta,
  renderDisplayHeading,
  renderGreeting,
  wrapInLayout,
} from './layout.js';
import type { RenderedEmail } from './welcome-otp.js';

export interface AccessCodeEmailArgs {
  firstName: string;
  code: string;
  inviteUrl: string;
}

export const accessCodeTemplate = ({
  firstName,
  code,
  inviteUrl,
}: AccessCodeEmailArgs): RenderedEmail => {
  const subject = `Your ${env.brand.name} access code is ready`;
  const preheader = `Use access code ${code} to create your account.`;

  const bodyHtml = `
${renderDisplayHeading(`You Are {{highlight}}Approved{{/highlight}}`)}
${renderBodyText(
  `Your invite is ready. Use the access code below to create your account and begin the ${escapeHtml(env.brand.name)} experience.`,
)}
${renderGreeting(firstName)}
<div style="margin:24px auto 10px;max-width:280px;background:#f5f1ff;border:1px solid #d8d1f0;border-radius:18px;padding:18px;text-align:center;">
  <div style="font-family:'Anton','Bebas Neue','Impact','Arial Black',sans-serif;font-size:36px;letter-spacing:4px;color:#6d3bff;font-weight:900;">
    ${escapeHtml(code)}
  </div>
</div>
${renderCta('Open Invite', inviteUrl)}
${renderCallout(`This code is tied to your email and can only be used once.`)}
`;

  const text = `Your ${env.brand.name} access code is ready.

Hi ${firstName},

Use this access code to create your account:

${code}

Open your invite: ${inviteUrl}

This code is tied to your email and can only be used once.

- ${env.brand.name}`;

  return {
    subject,
    html: wrapInLayout({ preheader, bodyHtml }),
    text,
  };
};
