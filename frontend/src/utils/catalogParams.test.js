import { catalogParams, updateCatalogParams, catalogLocation } from './catalogParams';

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

test('category locations keep encoded query data out of pathname', () => {
  const location = catalogLocation({ category: 'Audio & Home/音?' });
  expect(location.pathname).toBe('/products');
  expect(new URLSearchParams(location.search).get('category')).toBe('Audio & Home/音?');
  expect(catalogLocation({})).toEqual({ pathname: '/products', search: '' });
});
test('rating resets page and malformed values safely reach API validation', () => {
  const params = updateCatalogParams('page=3&category=Audio', { rating: 4 });
  expect(catalogParams(params)).toEqual({ category: 'Audio', rating: '4' });
  expect(catalogParams('?page=abc&rating=100&minPrice=-50')).toEqual({ page: 'abc', rating: '100', minPrice: '-50' });
});
