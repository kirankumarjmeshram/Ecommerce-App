import { createClient } from 'redis';

let redisClient;

const logRedis = (...message) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Redis]', ...message);
  }
};

const connectRedis = () => {
  if (!process.env.REDIS_URL) {
    logRedis('REDIS_URL is not configured; using MongoDB only');
    return;
  }

  let redisProtocol;
  try {
    redisProtocol = new URL(process.env.REDIS_URL).protocol;
  } catch {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Redis] REDIS_URL is invalid; using MongoDB only');
    }
    return;
  }

  if (!['redis:', 'rediss:'].includes(redisProtocol)) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Redis] REDIS_URL must use redis:// or rediss://; using MongoDB only');
    }
    return;
  }

  if (!redisClient) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Redis] client setup failed; using MongoDB only:', error.message);
      }
      redisClient = undefined;
      return;
    }
    redisClient.on('error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Redis] unavailable, using MongoDB:', error.message);
      }
    });
    redisClient.on('ready', () => logRedis('Connected'));
  }

  if (!redisClient.isOpen) {
    redisClient.connect().catch(() => {
      // The error listener logs a safe message and the API continues without cache.
    });
  }
};

const getRedisClient = () => redisClient;
const isRedisReady = () => Boolean(redisClient?.isReady);

export { connectRedis, getRedisClient, isRedisReady };
