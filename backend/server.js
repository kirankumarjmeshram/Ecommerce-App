import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import connectDB, { disconnectDB } from './config/db.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { logger } from './observability/logger.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, '../.env') });

const port = process.env.PORT || 5001;

const startServer = async () => {
  logger.info('Application starting');
  await connectDB();
  connectRedis();

  const server = app.listen(port, () => logger.info({ port }, 'Server listening'));
  let isShuttingDown = false;
  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info({ signal }, 'Shutdown requested');
    server.close(async (error) => {
      if (error) {
        logger.error({ err: error }, 'HTTP server shutdown failed');
        process.exitCode = 1;
      }
      try {
        await Promise.all([disconnectDB(), disconnectRedis()]);
        logger.info('Shutdown complete');
      } catch (shutdownError) {
        logger.error({ err: shutdownError }, 'Dependency shutdown failed');
        process.exitCode = 1;
      }
    });
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();
