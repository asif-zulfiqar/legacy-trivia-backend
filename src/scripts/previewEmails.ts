/**
 * Render every email template to an HTML file under `email-previews/` at
 * the project root so the designs can be inspected in a browser without
 * actually sending mail.
 *
 *   npm run preview:emails
 *   open email-previews/welcome-otp.html  # macOS
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { welcomeOtpTemplate } from '../services/email/templates/welcome-otp.js';
import { resetPasswordOtpTemplate } from '../services/email/templates/reset-password-otp.js';
import { congratsTemplate } from '../services/email/templates/congrats.js';
import { achievementTemplate } from '../services/email/templates/achievement.js';

const OUT_DIR = path.resolve(process.cwd(), 'email-previews');

const fixtures = [
  {
    file: 'welcome-otp.html',
    rendered: welcomeOtpTemplate({
      firstName: 'William',
      otp: '123456',
      expiresMinutes: 10,
    }),
  },
  {
    file: 'reset-password-otp.html',
    rendered: resetPasswordOtpTemplate({
      firstName: 'William',
      otp: '654321',
      expiresMinutes: 10,
    }),
  },
  {
    file: 'congrats.html',
    rendered: congratsTemplate({
      firstName: 'William',
      prize: 15,
      phaseName: 'The First Date',
    }),
  },
  {
    file: 'achievement.html',
    rendered: achievementTemplate({
      firstName: 'William',
      levelName: 'The Commitment',
      treasury: 215,
    }),
  },
];

const run = async (): Promise<void> => {
  await mkdir(OUT_DIR, { recursive: true });
  for (const { file, rendered } of fixtures) {
    const target = path.join(OUT_DIR, file);
    await writeFile(target, rendered.html, 'utf8');
    console.log(`✓ ${file}  subject: ${rendered.subject}`);
  }
  console.log(`\nPreviews written to: ${OUT_DIR}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
