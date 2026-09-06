import { jest } from '@jest/globals';
const entries = new Map();
let ready = true;
const client = {
  get: jest.fn(async (key) => entries.get(key)),
  set: jest.fn(async (key, value) => entries.set(key, value)),
  del: jest.fn(async (keys) => { for (const key of [keys].flat()) entries.delete(key); }),
  scan: jest.fn(async () => ({ cursor: '0', keys: [...entries.keys()].filter((key) => key.startsWith('ecommerce:products:list:')) })),
};
jest.unstable_mockModule('../config/redis.js', () => ({ getRedisClient: () => client, isRedisReady: () => ready }));
const { readCache, writeCache, createProductListCacheKey, createProductCacheKey, invalidateProductListCaches } = await import('../utils/productCache.js');
beforeEach(() => { ready = true; entries.clear(); });
test('list and categories invalidate without removing detail entries', async () => {
  const keys = [createProductListCacheKey({ category: 'Audio' }), createProductListCacheKey({ category: 'Gaming' }), createProductListCacheKey({ resource: 'categories' })];
  for (const key of keys) await writeCache(key, { products: [], totalProducts: 0 });
  const detail = createProductCacheKey('test');
  await writeCache(detail, { name: 'Kept' });
  expect(await readCache(keys[0])).toEqual({ products: [], totalProducts: 0 });
  await invalidateProductListCaches();
  for (const key of keys) expect(await readCache(key)).toBeNull();
  expect(await readCache(detail)).toEqual({ name: 'Kept' });
});
test('unavailable, failed and malformed Redis reads fall back safely', async () => {
  ready = false;
  expect(await readCache('test')).toBeNull();
  await writeCache('test', {});
  ready = true;
  client.get.mockRejectedValueOnce(new Error('Test outage'));
  expect(await readCache('test')).toBeNull();
  entries.set('test', 'not-json');
  expect(await readCache('test')).toBeNull();
  expect(entries.has('test')).toBe(false);
});
