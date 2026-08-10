import { getRedisClient, isRedisReady } from '../config/redis.js';

const PRODUCT_KEY_PREFIX = 'ecommerce:product:';
const PRODUCT_LIST_KEY_PREFIX = 'ecommerce:products:list:';
const DEFAULT_PRODUCT_TTL = 300;

const logRedis = (...message) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Redis]', ...message);
  }
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

const readCache = async (key) => {
  if (!isRedisReady()) return null;

  try {
    const cachedValue = await getRedisClient().get(key);
    if (!cachedValue) {
      logRedis('MISS', key);
      return null;
    }

    try {
      const data = JSON.parse(cachedValue);
      logRedis('HIT', key);
      return data;
    } catch {
      logRedis('Invalid cached JSON, refreshing', key);
      await getRedisClient().del(key).catch(() => {});
      return null;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Redis] unavailable, using MongoDB:', error.message);
    }
    return null;
  }
};

const writeCache = async (key, data) => {
  if (!isRedisReady()) return;

  try {
    await getRedisClient().set(key, JSON.stringify(data), { EX: getProductCacheTtl() });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Redis] cache write failed:', error.message);
    }
  }
};

const invalidateProductListCaches = async () => {
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

    logRedis('Invalidated product list cache');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Redis] product-list invalidation failed:', error.message);
    }
  }
};

const invalidateProductCache = async (productId) => {
  if (!isRedisReady()) return;

  try {
    await getRedisClient().del(createProductCacheKey(productId));
    logRedis('Invalidated product', productId);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Redis] product invalidation failed:', error.message);
    }
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
