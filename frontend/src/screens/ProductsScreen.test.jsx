import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductsScreen from './ProductsScreen';

let mockResult;
const mockRefetch = jest.fn();
jest.mock('../slices/productsApiSlice', () => ({
  useGetProductsQuery: () => ({ ...mockResult, refetch: mockRefetch }),
  useGetProductCategoriesQuery: () => ({ error: { status: 503 } }),
}));
const setup = () => render(<MemoryRouter><ProductsScreen /></MemoryRouter>);
beforeEach(() => { mockRefetch.mockClear(); mockResult = { currentData: { products: [], totalProducts: 0, page: 1, pages: 0 } }; });
test('API failure presents safe retry, not a raw object or empty-results state', () => {
  mockResult = { error: { status: 500, data: { message: { internal: 'database error' } } } };
  setup();
  expect(screen.getByRole('heading', { name: 'Unable to load products' })).toBeTruthy();
  expect(screen.queryByText('No products found')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mockRefetch).toHaveBeenCalledTimes(1);
});
test('bad query gets distinct invalid-filter recovery', () => {
  mockResult = { error: { status: 400 } };
  setup();
  expect(screen.getByRole('heading', { name: 'Invalid catalog filters' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
});
test('invalid price range gives an associated error and can be corrected', () => {
  setup();
  fireEvent.change(screen.getByLabelText('Minimum price'), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText('Maximum price'), { target: { value: '50' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply price range' }));
  expect(screen.getByRole('alert').textContent).toBe('Minimum price cannot be greater than maximum price.');
  expect(screen.getByLabelText('Minimum price').getAttribute('aria-describedby')).toBe('price-error');
  fireEvent.change(screen.getByLabelText('Minimum price'), { target: { value: '20' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply price range' }));
  expect(screen.queryByRole('alert')).toBeNull();
});
test('loading does not display unrelated previous-query products', () => {
  mockResult = { isFetching: true, data: { products: [{ name: 'Stale product' }] } };
  setup();
  expect(screen.getByRole('status').textContent).toBe('Updating products…');
  expect(screen.queryByText('Stale product')).toBeNull();
  expect(screen.queryByText('No products found')).toBeNull();
});
