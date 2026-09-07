import getErrorMessage from './getErrorMessage';
import { validatePriceRange } from './validatePriceRange';

test.each([
  [{ data: { message: 'Check the input' } }, 'Check the input'],
  [{ error: 'Connection unavailable' }, 'Connection unavailable'],
  [new Error('Please retry'), 'Please retry'],
  [{ data: { message: { bad: true } } }, 'Fallback'],
  [{ message: '[object Object]' }, 'Fallback'],
  [{ error: '<html>error</html>' }, 'Fallback'],
  [{ status: 500, data: { message: 'Internal DB error' } }, 'Fallback'],
  [{ status: 'FETCH_ERROR', error: 'TypeError: Failed to fetch' }, 'Fallback'],
  [undefined, 'Fallback'],
])('safe error message %#', (error, expected) => expect(getErrorMessage(error, 'Fallback')).toBe(expected));

test.each([['', '', ''], ['0', '100', ''], ['100', '50', 'Minimum price cannot be greater than maximum price.'], ['NaN', '', 'Enter valid, non-negative prices.'], ['-1', '', 'Enter valid, non-negative prices.'], ['', 'Infinity', 'Enter valid, non-negative prices.']])('validates prices %s %s', (min, max, expected) => expect(validatePriceRange(min, max)).toBe(expected));
