import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<typeof mongoose> => {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(env.mongoUri, {
    autoIndex: true,
  });
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};
