import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Question } from '../models/Question.js';
import { QUESTIONS } from './data/questions.js';

const buildDocs = (level: 1 | 2) =>
  QUESTIONS.map((q) => ({
    level,
    text: q.text,
    options: (['A', 'B', 'C', 'D'] as const).map((key) => ({ key, text: q.options[key] })),
    correctOption: q.correctOption,
    difficulty: 'easy' as const,
    isActive: true,
  }));

const run = async (): Promise<void> => {
  await connectDB();
  console.log(`Seeding ${QUESTIONS.length} questions per level (1 + 2)...`);

  await Question.deleteMany({});
  await Question.insertMany([...buildDocs(1), ...buildDocs(2)]);

  const l1 = await Question.countDocuments({ level: 1 });
  const l2 = await Question.countDocuments({ level: 2 });
  console.log(`✅ Seeded — Level 1: ${l1}, Level 2: ${l2}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
