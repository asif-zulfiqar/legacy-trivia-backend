import nodemailer, { type Transporter } from 'nodemailer';
import { env, isProd } from '../config/env.js';

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (transporter) return transporter;
  if (!env.smtp.host || !env.smtp.user) {
    console.warn('[email] SMTP not configured — emails will be logged to console.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  return transporter;
};

interface OtpEmailHtmlArgs {
  heading: string;
  intro: string;
  otp: string;
  footer: string;
}

const otpEmailHtml = ({ heading, intro, otp, footer }: OtpEmailHtmlArgs): string => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0a2e;font-family:Arial,Helvetica,sans-serif;color:#e9e8ff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#15123a;border-radius:14px;padding:32px;">
            <tr><td>
              <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">${heading}</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#cfcbf2;">${intro}</p>
              <div style="background:#231e58;border-radius:10px;padding:20px;text-align:center;letter-spacing:8px;font-size:28px;font-weight:bold;color:#fff;">
                ${otp}
              </div>
              <p style="margin:24px 0 0;font-size:12px;color:#9994c2;">${footer}</p>
            </td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:11px;color:#6e6a96;">© Legacy Trivia</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

interface SendEmailArgs {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: SendEmailArgs): Promise<{ messageId: string }> => {
  const t = getTransporter();
  const from = `"${env.smtp.fromName}" <${env.smtp.fromAddress}>`;

  if (!t) {
    console.log(`\n[email:dev]\nto: ${to}\nsubject: ${subject}\n${text || html}\n`);
    if (isProd) throw new Error('SMTP not configured');
    return { messageId: 'dev-stub' };
  }

  return t.sendMail({ from, to, subject, html, text });
};

interface SendOtpEmailArgs {
  to: string;
  otp: string;
  purpose: 'email_verification' | 'password_reset';
}

export const sendOtpEmail = async ({ to, otp, purpose }: SendOtpEmailArgs): Promise<{ messageId: string }> => {
  const isReset = purpose === 'password_reset';
  const subject = isReset
    ? 'Reset your Legacy Trivia password'
    : 'Verify your Legacy Trivia email';
  const heading = isReset ? 'Reset your password' : 'Email verification';
  const intro = isReset
    ? "We received a request to reset your password. Use the code below to continue. If you didn't request this, ignore this email."
    : "Welcome! Use the code below to verify your email and unlock your Legacy Trivia account.";
  const html = otpEmailHtml({
    heading,
    intro,
    otp,
    footer: `This code expires in ${env.otpExpiryMinutes} minutes. Never share it with anyone.`,
  });
  const text = `${heading}\n\nYour code: ${otp}\nExpires in ${env.otpExpiryMinutes} minutes.`;
  return sendEmail({ to, subject, html, text });
};
