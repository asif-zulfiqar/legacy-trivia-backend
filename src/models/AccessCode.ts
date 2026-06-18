import mongoose, { Schema, Types } from 'mongoose';

export interface IAccessCode {
  code: string;
  email: string;
  waitlistEntry?: Types.ObjectId;
  used: boolean;
  usedBy?: Types.ObjectId;
  usedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const accessCodeSchema = new Schema<IAccessCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    waitlistEntry: { type: Schema.Types.ObjectId, ref: 'WaitlistEntry' },
    used: { type: Boolean, default: false, index: true },
    usedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

accessCodeSchema.index({ email: 1, used: 1 });

export const AccessCode = mongoose.model<IAccessCode>('AccessCode', accessCodeSchema);
