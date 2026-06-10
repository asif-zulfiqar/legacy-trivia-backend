import nodemailer, { type Transporter } from 'nodemailer';
import { env, isProd } from '../../config/env.js';

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

export interface SendEmailArgs {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailArgs): Promise<{ messageId: string }> => {
  const t = getTransporter();
  const from = `"${env.smtp.fromName}" <${env.smtp.fromAddress}>`;

  if (!t) {
    console.log(
      `\n[email:dev]\nto: ${to}\nsubject: ${subject}\n${text || html}\n`
    );
    if (isProd) throw new Error('SMTP not configured');
    return { messageId: 'dev-stub' };
  }

  return t.sendMail({ from, to, subject, html, text });
};
