import mongoose, { Schema } from 'mongoose';

export interface ILoginVerificationSession {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  consumed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const loginVerificationSessionSchema = new Schema<ILoginVerificationSession>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

loginVerificationSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const LoginVerificationSession = mongoose.model<ILoginVerificationSession>(
  'LoginVerificationSession',
  loginVerificationSessionSchema
);
