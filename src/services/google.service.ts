import { OAuth2Client, type LoginTicket } from 'google-auth-library';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let client: OAuth2Client | null = null;

const getClient = (): OAuth2Client => {
  if (!env.google.clientId) {
    throw ApiError.internal('Google Sign-In is not configured.');
  }
  if (!client) client = new OAuth2Client(env.google.clientId);
  return client;
};

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  emailVerified: true;
}

export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleProfile> => {
  const c = getClient();
  let ticket: LoginTicket;
  try {
    ticket = await c.verifyIdToken({
      idToken,
      audience: env.google.clientId,
    });
  } catch {
    throw ApiError.unauthorized('Invalid Google token.');
  }
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified) {
    throw ApiError.unauthorized('Google email not verified.');
  }
  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    firstName: payload.given_name || '',
    lastName: payload.family_name || '',
    picture: payload.picture || '',
    emailVerified: true,
  };
};
