import mongoose, { Schema } from 'mongoose';

export interface IPasswordResetSession {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  consumed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const passwordResetSessionSchema = new Schema<IPasswordResetSession>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

passwordResetSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetSession = mongoose.model<IPasswordResetSession>(
  'PasswordResetSession',
  passwordResetSessionSchema
);
