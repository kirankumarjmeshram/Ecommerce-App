import { createClient } from 'redis';
import { logger } from '../observability/logger.js';

let redisClient;

const connectRedis = () => {
  if (!process.env.REDIS_URL) {
    logger.warn({ service: 'redis' }, 'Redis is not configured; cache is disabled');
    return;
  }

  let redisProtocol;
  try {
    redisProtocol = new URL(process.env.REDIS_URL).protocol;
  } catch {
    logger.warn({ service: 'redis' }, 'Redis URL is invalid; cache is disabled');
    return;
  }

  if (!['redis:', 'rediss:'].includes(redisProtocol)) {
    logger.warn({ service: 'redis' }, 'Redis URL must use redis or rediss protocol; cache is disabled');
    return;
  }

  if (!redisClient) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
    } catch (error) {
      logger.warn({ err: error, service: 'redis' }, 'Redis client setup failed; cache is disabled');
      redisClient = undefined;
      return;
    }
    redisClient.on('error', (error) => {
      logger.warn({ err: error, service: 'redis' }, 'Redis unavailable; cache is degraded');
    });
    redisClient.on('ready', () => logger.info({ service: 'redis' }, 'Redis connected'));
  }

  if (!redisClient.isOpen) {
    redisClient.connect().catch((error) => {
      logger.warn({ err: error, service: 'redis' }, 'Redis connection failed; cache is degraded');
    });
  }
};

const getRedisClient = () => redisClient;
const isRedisReady = () => Boolean(redisClient?.isReady);

const disconnectRedis = async () => {
  if (redisClient?.isOpen) await redisClient.quit();
};

export { connectRedis, disconnectRedis, getRedisClient, isRedisReady };
