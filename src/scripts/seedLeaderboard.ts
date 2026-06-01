import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { LeaderboardEntry } from '../models/LeaderboardEntry.js';
import { LEADERBOARD } from './data/leaderboard.js';

const run = async (): Promise<void> => {
  await connectDB();
  console.log(`Seeding ${LEADERBOARD.length} leaderboard entries...`);

  await LeaderboardEntry.deleteMany({});
  await LeaderboardEntry.insertMany(LEADERBOARD);

  const count = await LeaderboardEntry.countDocuments();
  console.log(`✅ Seeded — leaderboard entries: ${count}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
