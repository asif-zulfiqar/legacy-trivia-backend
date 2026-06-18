import crypto from 'crypto';
import type { Types } from 'mongoose';
import { AccessCode } from '../models/AccessCode.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export const normalizeAccessCode = (code: string): string =>
  code.trim().toUpperCase().replace(/\s+/g, '');

export const generateAccessCodeValue = (): string => {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)];
  }
  return code;
};

export const createUniqueAccessCode = async ({
  email,
  waitlistEntry,
}: {
  email: string;
  waitlistEntry?: Types.ObjectId;
}) => {
  for (let i = 0; i < 10; i += 1) {
    const code = generateAccessCodeValue();
    try {
      return await AccessCode.create({
        code,
        email,
        waitlistEntry,
      });
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        (err as { code?: number }).code === 11000
      ) {
        continue;
      }
      throw err;
    }
  }
  throw new Error('Unable to generate a unique access code.');
};
