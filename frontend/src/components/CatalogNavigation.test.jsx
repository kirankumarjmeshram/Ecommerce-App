import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Header from './Header';

jest.mock('react-redux', () => ({ useDispatch: () => jest.fn(), useSelector: (selector) => selector({ cart: { cartItems: [] }, auth: { userInfo: null } }) }));
let mockCategoryError;
jest.mock('../slices/productsApiSlice', () => ({ useGetProductCategoriesQuery: () => ({ data: { categories: ['Audio & Home'] }, error: mockCategoryError }) }));
jest.mock('../slices/usersApiSlice', () => ({ useLogoutMutation: () => [jest.fn()] }));
const Location = () => { const location = useLocation(); return <output data-testid="location">{location.pathname}{location.search}</output>; };
const setup = () => render(<MemoryRouter><Header /><Location /></MemoryRouter>);
beforeEach(() => { mockCategoryError = undefined; });
test('category failure keeps navigation usable', () => {
  mockCategoryError = { status: 503 };
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Categories' }));
  expect(screen.getByRole('link', { name: 'All Categories' }).getAttribute('href')).toBe('/products');
  expect(screen.queryByText('Audio & Home')).toBeNull();
});
test('header dropdown category navigates without invalid pathname', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Categories' }));
  fireEvent.click(screen.getByText('Audio & Home'));
  expect(screen.getByTestId('location').textContent).toBe('/products?category=Audio+%26+Home');
});
test('typing does not navigate; explicit submit trims and clearing resets', () => {
  setup();
  const input = screen.getByRole('searchbox');
  for (let index = 1; index <= 10; index++) fireEvent.change(input, { target: { value: 'headphones'.slice(0, index) } });
  expect(screen.getByTestId('location').textContent).toBe('/');
  fireEvent.change(input, { target: { value: '  headphones  ' } });
  fireEvent.submit(screen.getByRole('search'));
  expect(screen.getByTestId('location').textContent).toBe('/products?keyword=headphones');
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
  fireEvent.submit(screen.getByRole('search'));
  expect(screen.getByTestId('location').textContent).toBe('/products');
});
