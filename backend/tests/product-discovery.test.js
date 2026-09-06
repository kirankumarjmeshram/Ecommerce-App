import { app, request, startDatabase, stopDatabase, resetDatabase, createProduct } from './helpers.js';
import { parseProductQuery } from '../utils/productQuery.js';
import { createProductListCacheKey } from '../utils/productCache.js';

beforeAll(startDatabase);
afterAll(stopDatabase);
beforeEach(async () => {
  await resetDatabase();
  await createProduct({ name: 'Wireless headphones', brand: 'Sound', category: 'Audio', price: 100, rating: 4, createdAt: new Date('2025-01-01') });
  await createProduct({ name: 'Speaker', description: 'Wireless room speaker', category: 'Audio', price: 300, countInStock: 0, rating: 5, createdAt: new Date('2025-02-01') });
  await createProduct({ name: 'Mouse', brand: 'Wireless Gear', category: 'Accessories', price: 200, rating: 3, createdAt: new Date('2025-03-01') });
});

test('default list and categories have metadata and real distinct categories', async () => {
  const { body } = await request(app).get('/api/products').expect(200);
  expect(body).toMatchObject({ page: 1, pages: 1, totalProducts: 3 });
  expect(body.products.map((p) => p.name)).toEqual(['Mouse', 'Speaker', 'Wireless headphones']);
  const categories = await request(app).get('/api/products/categories').expect(200);
  expect(categories.body.categories).toEqual(['Accessories', 'Audio']);
});

test.each([
  ['keyword=wireless', 3], ['keyword=room', 1], ['keyword=Sound', 1],
  ['keyword=%2E%2A', 0], ['category=Audio', 2], ['category=Missing', 0],
  ['minPrice=200', 2], ['maxPrice=100', 1], ['inStock=true', 2],
  ['category=Audio&minPrice=200&inStock=true', 0],
  ['category=Audio&minPrice=100&maxPrice=250&keyword=wireless', 1],
])('filters safely combine: %s', async (query, count) => {
  const { body } = await request(app).get(`/api/products?${query}`).expect(200);
  expect(body.totalProducts).toBe(count);
  expect(body.products).toHaveLength(count);
});

test.each([['price_asc', [100, 200, 300]], ['price_desc', [300, 200, 100]], ['rating_desc', [300, 100, 200]]])('sorts before pagination: %s', async (sort, prices) => {
  const { body } = await request(app).get(`/api/products?sort=${sort}`).expect(200);
  expect(body.products.map((p) => p.price)).toEqual(prices);
  const paged = await request(app).get(`/api/products?sort=${sort}&page=2&limit=1`).expect(200);
  expect(paged.body).toMatchObject({ page: 2, pages: 3, totalProducts: 3 });
  expect(paged.body.products[0].price).toBe(prices[1]);
});

test('category + sort + page and out-of-range/empty pages', async () => {
  const response = await request(app).get('/api/products?category=Audio&sort=price_asc&page=2&limit=1').expect(200);
  expect(response.body.products[0].name).toBe('Speaker');
  expect(response.body.pages).toBe(2);
  const empty = await request(app).get('/api/products?page=99').expect(200);
  expect(empty.body.products).toEqual([]);
  expect(empty.body.totalProducts).toBe(3);
});

test.each(['page=0', 'page=1.5', 'limit=101', 'minPrice=-1', 'maxPrice=abc', 'minPrice=300&maxPrice=100', 'sort=__proto__', 'inStock=yes', 'category[$ne]=Audio', 'keyword=a&keyword=b', 'unknown=value'])('rejects invalid input: %s', async (query) => {
  await request(app).get(`/api/products?${query}`).expect(400);
});

test('normalized cache keys share defaults but isolate every discovery dimension', () => {
  const key = (query) => createProductListCacheKey(parseProductQuery(query).normalized);
  expect(key({})).toBe(key({ page: '1', limit: '12', sort: 'newest', inStock: 'false' }));
  const variants = [{ keyword: 'mouse' }, { category: 'Audio' }, { minPrice: '10' }, { maxPrice: '100' }, { inStock: 'true' }, { sort: 'price_asc' }, { page: '2' }, { limit: '2' }];
  expect(new Set([key({}), ...variants.map(key)]).size).toBe(9);
});
