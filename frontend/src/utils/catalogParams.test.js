import { catalogParams, updateCatalogParams } from './catalogParams';

test('catalog parameters include supported nonempty URL state', () => {
  expect(catalogParams('?category=Audio&keyword=wireless&minPrice=&sort=price_asc&page=2&other=x')).toEqual({ category: 'Audio', keyword: 'wireless', sort: 'price_asc', page: '2' });
});
test('filter changes reset page and preserve unrelated discovery state', () => {
  expect(updateCatalogParams('category=Audio&page=3&keyword=wireless', { sort: 'price_asc' }).toString()).toBe('category=Audio&keyword=wireless&sort=price_asc');
});
test('pagination preserves search and filters; clearing a field removes it', () => {
  const next = updateCatalogParams('category=Audio&minPrice=100&page=1', { page: 2 }, false);
  expect(next.toString()).toBe('category=Audio&minPrice=100&page=2');
  expect(updateCatalogParams(next, { category: '' }).toString()).toBe('minPrice=100');
});
