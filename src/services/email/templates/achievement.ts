import { env } from '../../../config/env.js';
import { assetUrl, escapeHtml, renderCallout, renderGreeting, wrapInLayout } from './layout.js';
import type { RenderedEmail } from './welcome-otp.js';

export interface AchievementArgs {
  firstName: string;
  levelName: string;
  treasury: number;
}

const formatMoney = (amount: number): string => {
  if (!Number.isFinite(amount)) return '$0';
  if (Number.isInteger(amount)) return `$${amount}`;
  return `$${amount.toFixed(2)}`;
};

const trophyBanner = `
<div style="text-align:center;margin:0 0 4px;">
  <span style="display:inline-block;font-size:64px;line-height:1;">🎉🏆🎊</span>
</div>`;

const renderAchievementTitle = (): string => `
<h1 class="display-heading" style="margin:8px 0 12px;font-family:'Anton','Bebas Neue','Impact','Arial Black',sans-serif;font-size:46px;font-weight:900;line-height:1.05;text-align:center;color:#c39831;letter-spacing:1.5px;">
  ACHIEVEMENT<br/>UNLOCKED
</h1>`;

const renderLevelCard = (levelName: string): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0;">
  <tr>
    <td style="background:#fbf2dc;border:1px solid #f0e2b5;border-radius:14px;padding:22px 18px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td align="center" style="padding-bottom:8px;">
            <span style="display:inline-block;padding:6px 16px;background:#dff6d4;color:#2e7d2e;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.6px;border-radius:999px;text-transform:uppercase;">Level Completed</span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:6px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#8a6e2a;">
            Level Conquered
          </td>
        </tr>
        <tr>
          <td align="center" style="font-family:'Anton','Bebas Neue','Impact','Arial Black',sans-serif;font-size:34px;font-weight:900;color:#0d0628;line-height:1.05;letter-spacing:0.4px;">
            ${escapeHtml(levelName)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

const renderTreasuryCard = (treasury: number): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0;">
  <tr>
    <td style="background:#f5f1ff;border:1px solid #e2dbf7;border-radius:14px;padding:22px 18px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td align="center" style="padding-bottom:10px;">
            <span style="display:inline-block;padding:6px 16px;background:#fbf2dc;color:#a17d18;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.6px;border-radius:999px;text-transform:uppercase;">Treasury Milestone</span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:4px;">
            <img src="${assetUrl('yourtreasury.png')}" alt="" width="64" height="64" style="display:inline-block;width:64px;height:64px;border:0;outline:none;" />
          </td>
        </tr>
        <tr>
          <td align="center" class="reward-amount" style="font-family:'Anton','Bebas Neue','Impact','Arial Black',sans-serif;font-size:60px;font-weight:900;color:#c39831;line-height:1;">
            ${escapeHtml(formatMoney(treasury))}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

export const achievementTemplate = ({
  firstName,
  levelName,
  treasury,
}: AchievementArgs): RenderedEmail => {
  const subject = `🏆 Achievement Unlocked — ${levelName}`;
  const preheader = `You conquered ${levelName} and built your Treasury to ${formatMoney(treasury)}.`;

  const bodyHtml = `
${trophyBanner}
${renderAchievementTitle()}
<p style="margin:0 0 22px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.55;color:#0d0628;text-align:center;font-weight:700;">
  The <span style="color:#7c4dff;">${escapeHtml(env.brand.name.toUpperCase())}</span> community is celebrating your <span style="color:#c39831;">latest milestone</span>.
</p>
${renderGreeting(firstName)}
<p style="margin:0 0 8px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f1a3a;">
  You did it! You've conquered <strong>${escapeHtml(levelName)}</strong> and built your Treasury up to <strong>${escapeHtml(formatMoney(treasury))}</strong>, marking a major milestone.
</p>
${renderLevelCard(levelName)}
${renderTreasuryCard(treasury)}
${renderCallout(`🎉 The ${escapeHtml(env.brand.name)} community is celebrating your win.`)}
${renderCallout(`⚔️ Now it's your move: secure your winnings or keep building your legacy.`)}
`;

  const text = `Achievement Unlocked!

Hi ${firstName},

You did it! You've conquered ${levelName} and built your Treasury up to ${formatMoney(treasury)}, marking a major milestone.

LEVEL COMPLETED: ${levelName}
TREASURY MILESTONE: ${formatMoney(treasury)}

The ${env.brand.name} community is celebrating your win.
Now it's your move: secure your winnings or keep building your legacy.

— ${env.brand.name}`;

  return {
    subject,
    html: wrapInLayout({ preheader, bodyHtml }),
    text,
  };
};
