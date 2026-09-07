export const catalogParams = (search) => Object.fromEntries(
  [...new URLSearchParams(search)].filter(([key, value]) =>
    ['keyword', 'category', 'minPrice', 'maxPrice', 'inStock', 'rating', 'sort', 'page', 'limit'].includes(key) && value !== '')
);

// LinkContainer requires the query string separately from pathname.
export const catalogLocation = (values = {}) => {
  const search = new URLSearchParams(values).toString();
  return { pathname: '/products', search: search ? `?${search}` : '' };
};

export const updateCatalogParams = (search, changes, resetPage = true) => {
  const params = new URLSearchParams(search);
  if (resetPage) params.delete('page');
  Object.entries(changes).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) params.delete(key);
    else params.set(key, String(value));
  });
  return params;
};
