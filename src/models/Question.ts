import mongoose, { Schema } from 'mongoose';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface IOption {
  key: OptionKey;
  text: string;
}

export interface IQuestion {
  level: 1 | 2;
  text: string;
  options: IOption[];
  correctOption: OptionKey;
  difficulty: 'easy' | 'normal';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const optionSchema = new Schema<IOption>(
  {
    key: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>(
  {
    level: { type: Number, enum: [1, 2], required: true, index: true },
    text: { type: String, required: true, trim: true },
    options: {
      type: [optionSchema],
      validate: (v: unknown) => Array.isArray(v) && v.length === 4,
    },
    correctOption: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'normal'],
      default: 'easy',
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

questionSchema.index({ level: 1, difficulty: 1, isActive: 1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
