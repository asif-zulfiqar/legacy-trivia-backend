import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
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
    fromName: process.env.EMAIL_FROM_NAME || 'Legacy Trivia',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@legacytrivia.com',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

export const isProd = env.nodeEnv === 'production';
