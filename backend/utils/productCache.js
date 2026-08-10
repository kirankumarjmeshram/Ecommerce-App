import { getRedisClient, isRedisReady } from '../config/redis.js';
import { logger } from '../observability/logger.js';
import { recordRedisCacheError, recordRedisCacheHit, recordRedisCacheMiss } from '../observability/metrics.js';

const PRODUCT_KEY_PREFIX = 'ecommerce:product:';
const PRODUCT_LIST_KEY_PREFIX = 'ecommerce:products:list:';
const DEFAULT_PRODUCT_TTL = 300;

const getCacheType = (key) => (key.startsWith(PRODUCT_LIST_KEY_PREFIX) ? 'product_list' : 'product_detail');

const logCacheFailure = ({ cache, operation, requestId, error }) => {
  recordRedisCacheError(cache);
  logger.warn({
    ...(requestId ? { requestId } : {}),
    ...(error ? { err: error } : {}),
    service: 'redis',
    cache,
    operation,
  }, 'Redis cache operation failed; using MongoDB fallback where applicable');
};

const getProductCacheTtl = () => {
  const ttl = Number.parseInt(process.env.REDIS_PRODUCT_TTL, 10);
  return Number.isSafeInteger(ttl) && ttl > 0 ? ttl : DEFAULT_PRODUCT_TTL;
};

const createProductCacheKey = (productId) => `${PRODUCT_KEY_PREFIX}${productId}`;

const createProductListCacheKey = (query = {}) => {
  const signature = Object.entries(query)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .flatMap(([key, value]) => {
      const values = Array.isArray(value) ? [...value].sort() : [value];
      return values.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
    })
    .join('&');

  return `${PRODUCT_LIST_KEY_PREFIX}${signature || 'all'}`;
};

const readCache = async (key, { requestId } = {}) => {
  const cache = getCacheType(key);
  if (!isRedisReady()) {
    if (getRedisClient()) logCacheFailure({ cache, operation: 'read_unavailable', requestId });
    return null;
  }

  try {
    const cachedValue = await getRedisClient().get(key);
    if (!cachedValue) {
      recordRedisCacheMiss(cache);
      return null;
    }

    try {
      const data = JSON.parse(cachedValue);
      recordRedisCacheHit(cache);
      return data;
    } catch {
      logCacheFailure({ cache, operation: 'parse', requestId });
      await getRedisClient().del(key).catch(() => {});
      return null;
    }
  } catch (error) {
    logCacheFailure({ cache, operation: 'read', requestId, error });
    return null;
  }
};

const writeCache = async (key, data, { requestId } = {}) => {
  if (!isRedisReady()) return;

  try {
    await getRedisClient().set(key, JSON.stringify(data), { EX: getProductCacheTtl() });
  } catch (error) {
    logCacheFailure({ cache: getCacheType(key), operation: 'write', requestId, error });
  }
};

const invalidateProductListCaches = async ({ requestId } = {}) => {
  if (!isRedisReady()) return;

  try {
    let cursor = '0';
    do {
      const result = await getRedisClient().scan(cursor, {
        MATCH: `${PRODUCT_LIST_KEY_PREFIX}*`,
        COUNT: 100,
      });
      cursor = result.cursor;
      if (result.keys.length) {
        await getRedisClient().del(result.keys);
      }
    } while (cursor !== '0');

  } catch (error) {
    logCacheFailure({ cache: 'product_list', operation: 'invalidate', requestId, error });
  }
};

const invalidateProductCache = async (productId, { requestId } = {}) => {
  if (!isRedisReady()) return;

  try {
    await getRedisClient().del(createProductCacheKey(productId));
  } catch (error) {
    logCacheFailure({ cache: 'product_detail', operation: 'invalidate', requestId, error });
  }
};

export {
  createProductCacheKey,
  createProductListCacheKey,
  readCache,
  writeCache,
  invalidateProductCache,
  invalidateProductListCaches,
};
