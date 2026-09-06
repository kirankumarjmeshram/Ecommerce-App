export const catalogParams = (search) => Object.fromEntries(
  [...new URLSearchParams(search)].filter(([key, value]) =>
    ['keyword', 'category', 'minPrice', 'maxPrice', 'inStock', 'sort', 'page', 'limit'].includes(key) && value !== '')
);

export const updateCatalogParams = (search, changes, resetPage = true) => {
  const params = new URLSearchParams(search);
  if (resetPage) params.delete('page');
  Object.entries(changes).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) params.delete(key);
    else params.set(key, String(value));
  });
  return params;
};
