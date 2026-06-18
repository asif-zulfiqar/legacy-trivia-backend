import mongoose, { Schema } from 'mongoose';

export interface IOtp {
  email: string;
  otpHash: string;
  purpose: 'email_verification' | 'password_reset' | 'login_verification';
  attempts: number;
  expiresAt: Date;
  consumed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['email_verification', 'password_reset', 'login_verification'],
      required: true,
      index: true,
    },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
