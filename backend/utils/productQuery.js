const sorts = {
  newest: { createdAt: -1, _id: -1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  rating_desc: { rating: -1, _id: 1 },
};

// Only scalar, explicitly supported values reach MongoDB or a cache key.
export const parseProductQuery = (query) => {
  const fail = (message) => { const error = new Error(message); error.statusCode = 400; throw error; };
  const allowed = ['keyword', 'category', 'minPrice', 'maxPrice', 'inStock', 'rating', 'sort', 'page', 'limit'];
  for (const [key, value] of Object.entries(query)) {
    if (!allowed.includes(key) || typeof value !== 'string') fail('Invalid catalog query');
  }
  const normalized = { keyword: (query.keyword || '').trim(), category: (query.category || '').trim(), sort: query.sort || 'newest', page: 1, limit: 12, inStock: query.inStock || 'false' };
  if (normalized.keyword.length > 100 || normalized.category.length > 100) fail('Search and category must be at most 100 characters');
  if (!Object.hasOwn(sorts, normalized.sort)) fail('Invalid sort option');
  if (!['true', 'false'].includes(normalized.inStock)) fail('Invalid stock filter');
  for (const key of ['page', 'limit']) {
    const value = query[key] === undefined ? normalized[key] : Number(query[key]);
    if (!Number.isSafeInteger(value) || value < 1 || value > (key === 'limit' ? 100 : 100000)) fail(`Invalid ${key}`);
    normalized[key] = value;
  }
  const filter = {};
  if (query.rating !== undefined) {
    if (!['1', '2', '3', '4', '5'].includes(query.rating)) fail('Rating must be between 1 and 5');
    normalized.rating = Number(query.rating);
    filter.rating = { $gte: normalized.rating };
  }
  for (const key of ['minPrice', 'maxPrice']) {
    if (query[key] === undefined || query[key] === '') continue;
    const value = Number(query[key]);
    if (!query[key].trim() || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) fail(`Invalid ${key}`);
    normalized[key] = value;
    filter.price = { ...filter.price, [key === 'minPrice' ? '$gte' : '$lte']: value };
  }
  if (normalized.minPrice > normalized.maxPrice) fail('Minimum price must not exceed maximum price');
  if (normalized.category) filter.category = normalized.category;
  if (normalized.inStock === 'true') filter.countInStock = { $gt: 0 };
  if (normalized.keyword) {
    const escaped = normalized.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = ['name', 'brand', 'description'].map((field) => ({ [field]: { $regex: escaped, $options: 'i' } }));
  }
  return { normalized, filter, sort: sorts[normalized.sort] };
};
