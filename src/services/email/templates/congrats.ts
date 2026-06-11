import { env } from '../../../config/env.js';
import {
  assetUrl,
  escapeHtml,
  renderCallout,
  renderGreeting,
  wrapInLayout,
} from './layout.js';
import type { RenderedEmail } from './welcome-otp.js';

export interface CongratsArgs {
  firstName: string;
  prize: number;
  phaseName?: string;
}

const formatMoney = (amount: number): string => {
  if (!Number.isFinite(amount)) return '$0';
  if (Number.isInteger(amount)) return `$${amount}`;
  return `$${amount.toFixed(2)}`;
};

/**
 * "CONGRATULATIONS" multi-colored display heading — letter-by-letter color band.
 * Three color groups: red-orange → black → purple, matching the design.
 */
const renderRainbowCongrats = (): string => {
  const letters = 'CONGRATULATIONS'.split('');
  // First 4 letters red/coral, middle 7 black, last 4 purple
  const colored = letters
    .map((ch, i) => {
      const color = i < 4 ? '#e0635a' : i < 11 ? '#0d0628' : '#7c4dff';
      return `<span style="color:${color};">${ch}</span>`;
    })
    .join('');
  return `
<h1 class="display-heading" style="margin:6px 0 10px;font-family:'Anton','Bebas Neue','Impact','Arial Black',sans-serif;font-size:46px;font-weight:900;line-height:1.05;text-align:center;letter-spacing:1.5px;">
  ${colored}
</h1>`;
};

const buntingIcon = `
<div style="text-align:center;margin:0 0 18px;">
  <span style="display:inline-block;font-size:42px;line-height:1;">🎉🎊🎉</span>
</div>`;

const renderRewardCard = (prize: number): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
  <tr>
    <td style="background:#f5f1ff;border:1px solid #e2dbf7;border-radius:14px;padding:24px 20px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td align="center" style="padding-bottom:14px;">
            <span style="display:inline-block;padding:6px 16px;background:#dff6d4;color:#2e7d2e;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.6px;border-radius:999px;text-transform:uppercase;">First Reward Unlocked</span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:10px;">
            <div class="reward-amount" style="font-family:'Anton','Bebas Neue','Impact','Arial Black',sans-serif;font-size:72px;font-weight:900;color:#7c4dff;line-height:1;">${escapeHtml(formatMoney(prize))}</div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:6px 0 4px;">
            <img src="${assetUrl('yourtreasury.png')}" alt="" width="64" height="64" style="display:inline-block;width:64px;height:64px;border:0;outline:none;" />
          </td>
        </tr>
        <tr>
          <td align="center" style="font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#6e639a;">
            Waiting in your Treasury
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

export const congratsTemplate = ({
  firstName,
  prize,
  phaseName = 'First Date',
}: CongratsArgs): RenderedEmail => {
  const subject = `Congratulations, ${firstName}! Your first reward is unlocked 🎉`;
  const preheader = `You just unlocked ${formatMoney(prize)} in your Treasury — your journey begins.`;
  const money = formatMoney(prize);

  const bodyHtml = `
${renderRainbowCongrats()}
${buntingIcon}
<p style="margin:0 0 22px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:17px;line-height:1.55;color:#0d0628;text-align:center;font-weight:700;">
  Your <span style="color:#7c4dff;">JOURNEY</span> begins here. Take your first step and <span style="color:#e0635a;">start building your legacy</span>.
</p>
${renderGreeting(firstName)}
<p style="margin:0 0 4px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f1a3a;">
  This is your chance to build something real. Every empire starts with a first move. Yours begins in the ${escapeHtml(phaseName)} phase.
</p>
${renderRewardCard(prize)}
<p style="margin:8px 0 6px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f1a3a;">
  Trust your instincts, play smart, and your first <span style="color:#7c4dff;font-weight:700;">${escapeHtml(money)}</span> reward will be waiting in your Treasury.
</p>
${renderCallout(`The Hall of Fortunes awaits.`)}
`;

  const text = `Congratulations, ${firstName}!

Your journey begins here. Take your first step and start building your legacy.

This is your chance to build something real. Every empire starts with a first move. Yours begins in the ${phaseName} phase.

FIRST REWARD UNLOCKED: ${money}
(Waiting in your Treasury)

Trust your instincts, play smart, and your first ${money} reward will be waiting in your Treasury.

The Hall of Fortunes awaits.

— ${env.brand.name}`;

  return {
    subject,
    html: wrapInLayout({ preheader, bodyHtml }),
    text,
  };
};
