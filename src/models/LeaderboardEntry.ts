import mongoose, { Schema } from 'mongoose';

export interface ILeaderboardEntry {
  name: string;
  playerId: string;
  score: number;
  matches: number;
  winrate: number;
  region: string;
  avatarColor: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const leaderboardEntrySchema = new Schema<ILeaderboardEntry>(
  {
    name: { type: String, required: true, trim: true },
    playerId: { type: String, required: true, trim: true },
    score: { type: Number, required: true, index: true },
    matches: { type: Number, default: 0 },
    winrate: { type: Number, default: 0 },
    region: { type: String, default: 'GLOBAL', trim: true },
    avatarColor: { type: String, default: '#5B8DEF' },
  },
  { timestamps: true }
);

leaderboardEntrySchema.index({ score: -1 });

export const LeaderboardEntry = mongoose.model<ILeaderboardEntry>(
  'LeaderboardEntry',
  leaderboardEntrySchema
);
