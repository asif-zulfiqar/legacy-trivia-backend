import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const generateOtp = (length = 6): string => {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(length, '0');
};

export const hashOtp = async (otp: string): Promise<string> => bcrypt.hash(otp, 10);

export const compareOtp = async (otp: string, hash: string): Promise<boolean> =>
  bcrypt.compare(otp, hash);
