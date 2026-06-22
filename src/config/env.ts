import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

/**
 * CLIENT_URL is commonly a comma-separated CORS allowlist
 * (e.g. `https://pairpel.com,https://www.pairpel.com`). Anywhere we need
 * ONE concrete URL (email links, asset hosts) we take the first entry
 * and drop the trailing slash so URL concatenation is predictable.
 */
const primaryUrl = (raw: string | undefined): string => {
  const first = (raw || 'http://localhost:3000').split(',')[0]?.trim() ?? '';
  return first.replace(/\/$/, '');
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5001,

  mongoUri: required('MONGODB_URI'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 10,
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromName: process.env.EMAIL_FROM_NAME || 'Pairpel',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@pairpel.com',
  },

  brand: {
    name: process.env.BRAND_NAME || 'Pairpel',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@pairpel.com',
    appUrl: primaryUrl(process.env.CLIENT_URL),
    // Where image assets are served from. Email clients require absolute,
    // publicly-reachable HTTPS URLs. Default to the live Pairpel asset host
    // so local/dev CLIENT_URL values never produce broken email images.
    assetsBaseUrl: primaryUrl(
      process.env.BRAND_ASSETS_BASE_URL || 'https://pairpel.com/images',
    ),
    addressLine: process.env.BRAND_ADDRESS || '123 Trivia Lane, Game City, Playland',
    legalName: process.env.BRAND_LEGAL_NAME || 'Pairpel Games Ltd.',
    instagramUrl:
      process.env.BRAND_INSTAGRAM_URL ||
      'https://www.instagram.com/pairpeltrivia?igsh=Ync4cm55Z3NqaXh6',
    discordUrl: process.env.BRAND_DISCORD_URL || 'https://discord.gg/VAT567AMh',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

export const isProd = env.nodeEnv === 'production';
