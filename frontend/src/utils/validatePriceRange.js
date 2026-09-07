export const validatePriceRange = (min, max) => {
  for (const value of [min, max]) {
    if (value !== '' && (!String(value).trim() || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > Number.MAX_SAFE_INTEGER)) return 'Enter valid, non-negative prices.';
  }
  return min !== '' && max !== '' && Number(min) > Number(max) ? 'Minimum price cannot be greater than maximum price.' : '';
};
