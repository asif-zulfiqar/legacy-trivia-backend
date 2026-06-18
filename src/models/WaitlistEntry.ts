import mongoose, { Schema, Types } from 'mongoose';

export interface IWaitlistAnswer {
  question: string;
  answer: string;
}

export interface IWaitlistEntry {
  email: string;
  fullName: string;
  answers: IWaitlistAnswer[];
  status: 'pending' | 'approved';
  accessCode?: Types.ObjectId;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const waitlistAnswerSchema = new Schema<IWaitlistAnswer>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const waitlistEntrySchema = new Schema<IWaitlistEntry>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    fullName: { type: String, trim: true, default: '' },
    answers: { type: [waitlistAnswerSchema], default: [] },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending', index: true },
    accessCode: { type: Schema.Types.ObjectId, ref: 'AccessCode' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

waitlistEntrySchema.index({ status: 1, createdAt: -1 });

export const WaitlistEntry = mongoose.model<IWaitlistEntry>(
  'WaitlistEntry',
  waitlistEntrySchema
);
