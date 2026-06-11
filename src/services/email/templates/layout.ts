import { env } from '../../../config/env.js';

/**
 * Shared email layout. Returns the outer HTML shell with branded header
 * and footer matching the Pairpel design system. Inner content is injected
 * inside the white card.
 *
 * Email-safe constraints:
 *  - Tables only (Outlook).
 *  - All styles inline.
 *  - Web fonts loaded with fallbacks (graceful degrade to Impact/Arial Black).
 *  - Max body width 640px, mobile-friendly via @media in <head>.
 *  - Preheader for inbox preview.
 */

export interface LayoutArgs {
  preheader: string;
  bodyHtml: string;
}

const HEADER_BG =
  'background-color:#1a0d3d;background-image:radial-gradient(circle at 20% 30%,#3a1f7a 0%,transparent 45%),radial-gradient(circle at 80% 70%,#2a1560 0%,transparent 50%),linear-gradient(135deg,#1a0d3d 0%,#0d0628 100%);';

const FOOTER_BG = HEADER_BG;

/** Build an absolute URL for an asset under the frontend's /images folder. */
export const assetUrl = (filename: string): string => {
  const base = env.brand.assetsBaseUrl.replace(/\/$/, '');
  const file = filename.replace(/^\//, '');
  return `${base}/${file}`;
};

/**
 * Brand logo block. Prefers the hosted `logo.png` from the frontend's
 * `/public/images/` folder. Falls back to styled text (PAIR + PEL) if the
 * image fails to load — controlled by `<img alt>` + inline text fallback.
 */
const brandLogoHtml = `
<img src="${assetUrl('logo.png')}" alt="PAIRPEL" width="148" height="36" style="display:inline-block;max-width:148px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />`;

const renderHeader = (): string => `
<tr>
  <td style="${HEADER_BG}padding:32px 24px;text-align:center;border-radius:18px 18px 0 0;">
    ${brandLogoHtml}
  </td>
</tr>`;

const renderFooter = (): string => `
<tr>
  <td style="${FOOTER_BG}padding:32px 24px 28px;text-align:center;border-radius:0 0 18px 18px;color:#e5e1ff;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding-bottom:14px;">
          <a href="${env.brand.instagramUrl}" style="display:inline-block;margin:0 6px;text-decoration:none;line-height:0;">
            <img src="${assetUrl('instagram-icon.jpeg')}" alt="Instagram" width="28" height="28" style="display:inline-block;width:28px;height:28px;border:0;outline:none;border-radius:6px;" />
          </a>
          <a href="${env.brand.discordUrl}" style="display:inline-block;margin:0 6px;text-decoration:none;line-height:0;">
            <img src="${assetUrl('discord-icon.png')}" alt="Discord" width="28" height="28" style="display:inline-block;width:28px;height:28px;border:0;outline:none;" />
          </a>
        </td>
      </tr>
      <tr>
        <td align="center" style="font-size:14px;line-height:1.6;color:#e5e1ff;padding-bottom:4px;">
          ${escapeHtml(env.brand.legalName)}
        </td>
      </tr>
      <tr>
        <td align="center" style="font-size:13px;line-height:1.6;color:#bfb5e8;padding-bottom:6px;">
          ${escapeHtml(env.brand.addressLine)}
        </td>
      </tr>
      <tr>
        <td align="center" style="font-size:13px;line-height:1.6;color:#bfb5e8;padding-bottom:6px;">
          Support: <a href="mailto:${env.brand.supportEmail}" style="color:#b495ff;text-decoration:none;">${escapeHtml(env.brand.supportEmail)}</a>
        </td>
      </tr>
      <tr>
        <td align="center" style="font-size:12px;line-height:1.6;color:#bfb5e8;padding-bottom:10px;">
          <a href="${env.brand.appUrl}/privacy-policy" style="color:#bfb5e8;text-decoration:none;">Privacy Policy</a>
          <span style="margin:0 6px;color:#6e639a;">|</span>
          <a href="${env.brand.appUrl}/terms-and-conditions" style="color:#bfb5e8;text-decoration:none;">Terms of Service</a>
          <span style="margin:0 6px;color:#6e639a;">|</span>
          <a href="${env.brand.appUrl}/settings" style="color:#bfb5e8;text-decoration:none;">Unsubscribe</a>
        </td>
      </tr>
      <tr>
        <td align="center" style="font-size:12px;color:#bfb5e8;padding-bottom:16px;">
          © ${new Date().getFullYear()} ${escapeHtml(env.brand.name)}. All rights reserved.
        </td>
      </tr>
      <tr>
        <td align="center" style="border-top:1px solid #3d2c70;padding-top:12px;font-size:11px;color:#9b8fc8;line-height:1.5;">
          You're receiving this email because you registered for a ${escapeHtml(env.brand.name)} account.
        </td>
      </tr>
    </table>
  </td>
</tr>`;

export const wrapInLayout = ({ preheader, bodyHtml }: LayoutArgs): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>${escapeHtml(env.brand.name)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
    <!--[if mso]>
    <style>
      body, table, td, p, a { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .card-padding { padding: 28px 22px !important; }
        .display-heading { font-size: 36px !important; line-height: 1.1 !important; }
        .reward-amount { font-size: 56px !important; }
        .otp-pill { padding: 6px 10px !important; font-size: 16px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#efece4;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <div style="display:none;font-size:1px;color:#efece4;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
      ${escapeHtml(preheader)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#efece4;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" class="container" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(13,6,40,0.08);">
            ${renderHeader()}
            <tr>
              <td class="card-padding" style="background:#ffffff;padding:40px 36px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;color:#0d0628;">
                ${bodyHtml}
              </td>
            </tr>
            ${renderFooter()}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

/* ── Reusable building blocks ─────────────────────────────────────────── */

export const escapeHtml = (raw: string): string =>
  String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Render a row of OTP digit "pills" matching the design.
 */
export const renderOtpDigits = (otp: string): string => {
  const digits = otp.split('');
  const pills = digits
    .map(
      (d) =>
        `<td align="center" style="padding:0 4px;"><div class="otp-pill" style="display:inline-block;min-width:30px;padding:8px 12px;background:#ffffff;border:1px solid #d8d1f0;border-radius:8px;font-family:'Anton','Bebas Neue','Impact','Arial Black',sans-serif;font-size:20px;font-weight:900;color:#0d0628;line-height:1;">${escapeHtml(d)}</div></td>`
    )
    .join('');

  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto;background:#f5f1ff;border:1px solid #e2dbf7;border-radius:14px;padding:14px 10px;">
  <tr>${pills}</tr>
</table>`;
};

/**
 * Render a purple-bordered callout box for secondary info / warnings.
 */
export const renderCallout = (html: string): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 4px;">
  <tr>
    <td style="background:#f5f1ff;border-left:4px solid #8b5cf6;border-radius:10px;padding:16px 18px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;color:#4c3a85;line-height:1.55;">
      ${html}
    </td>
  </tr>
</table>`;

/**
 * Render a primary "Continue Playing" / generic CTA button.
 */
export const renderCta = (label: string, href: string): string => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto;">
  <tr>
    <td align="center" style="border-radius:14px;background:linear-gradient(180deg,#7c4dff 0%,#5a2fcf 100%);background-color:#6d3bff;box-shadow:0 8px 18px rgba(109,59,255,0.35);">
      <a href="${href}" style="display:inline-block;padding:14px 32px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:14px;">
        ${escapeHtml(label)}
      </a>
    </td>
  </tr>
</table>`;

/**
 * Display heading style — big bold black with a colored highlight section.
 * Use {{highlight}} marker in the text to color part of it.
 */
export const renderDisplayHeading = (text: string, highlightColor = '#7c4dff'): string => {
  const safe = escapeHtml(text);
  const withColor = safe.replace(
    /\{\{highlight\}\}([^{]+)\{\{\/highlight\}\}/g,
    (_m, inner) => `<span style="color:${highlightColor};">${inner}</span>`
  );
  return `
<h1 class="display-heading" style="margin:0 0 14px;font-family:'Anton','Bebas Neue','Impact','Arial Black',sans-serif;font-size:44px;font-weight:900;line-height:1.05;color:#0d0628;text-align:center;letter-spacing:0.5px;">
  ${withColor}
</h1>`;
};

export const renderBodyText = (text: string, align: 'left' | 'center' = 'center'): string => `
<p style="margin:0 0 16px;font-family:Inter,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f1a3a;text-align:${align};">
  ${text}
</p>`;

export const renderGreeting = (firstName: string): string => `
<h2 style="margin:8px 0 6px;font-family:'Anton','Bebas Neue','Impact','Arial Black',sans-serif;font-size:24px;font-weight:900;color:#0d0628;letter-spacing:0.3px;">
  Hi ${escapeHtml(firstName)},
</h2>`;
