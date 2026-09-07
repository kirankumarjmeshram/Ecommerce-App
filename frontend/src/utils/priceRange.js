import { validatePriceRange } from './validatePriceRange';
export const clampRange = (value, min, max) => Math.min(max, Math.max(min, Number(value)));
export const validateCatalogRange = (min, max, bounds) => {
  const error = validatePriceRange(min, max);
  if (error) return error;
  if (bounds && [min, max].some((value) => value !== '' && (Number(value) < bounds.min || Number(value) > bounds.max))) return 'Enter prices within the available catalog range.';
  return '';
};
