import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

export interface ILevelProgress {
  level1Completed: boolean;
  level2Completed: boolean;
  level1CompletedAt?: Date;
  level2CompletedAt?: Date;
  highestLevelUnlocked: number;
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  googleId?: string;
  authProvider: 'local' | 'google';
  profilePicture: string;
  isVerified: boolean;
  role: 'user' | 'admin';
  isTestAccount: boolean;
  treasury: number;
  levelProgress: ILevelProgress;
  referralCode?: string;
  btcAddress: string;
  soundOn: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const levelProgressSchema = new Schema<ILevelProgress>(
  {
    level1Completed: { type: Boolean, default: false },
    level2Completed: { type: Boolean, default: false },
    level1CompletedAt: { type: Date },
    level2CompletedAt: { type: Date },
    highestLevelUnlocked: { type: Number, default: 1 },
  },
  { _id: false }
);

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, select: false },
    googleId: { type: String, index: true, sparse: true },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    profilePicture: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isTestAccount: { type: Boolean, default: false },

    treasury: { type: Number, default: 0 },
    levelProgress: { type: levelProgressSchema, default: () => ({}) },

    referralCode: { type: String, index: true, sparse: true },
    btcAddress: { type: String, default: '' },
    soundOn: { type: Boolean, default: true },

    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(
  this: HydratedDocument<IUser, IUserMethods>,
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
