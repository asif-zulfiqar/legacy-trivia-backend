import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const start = async (): Promise<void> => {
  try {
    await connectDB();
    const server = app.listen(env.port, () => {
      console.log(`🚀 Legacy Trivia API running on http://localhost:${env.port}`);
    });

    const shutdown = (signal: string): void => {
      console.log(`\n${signal} received. Closing server...`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled rejection:', reason);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
