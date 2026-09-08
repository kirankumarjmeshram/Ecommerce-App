import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomeScreen from './HomeScreen';

jest.mock('../hooks/useReducedMotion', () => () => false);
jest.mock('react-bootstrap', () => {
  const actual = jest.requireActual('react-bootstrap');
  const Carousel = ({ interval, onMouseEnter, onMouseLeave, children }) => <div data-testid="carousel" data-interval={interval ?? 'off'} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>{children}</div>;
  Carousel.Item = ({ children }) => <div>{children}</div>;
  return { ...actual, Carousel };
});
jest.mock('../slices/productsApiSlice', () => ({
  useGetProductsQuery: () => ({ data: { products: [] }, refetch: jest.fn() }),
  useGetProductCategoriesQuery: () => ({ data: { categories: [] } }),
}));

test('carousel interval pauses on hover and resumes without duplicate state', () => {
  render(<MemoryRouter><HomeScreen /></MemoryRouter>);
  const carousel = screen.getByTestId('carousel');
  expect(carousel).toHaveAttribute('data-interval', '5000');
  fireEvent.mouseEnter(carousel); expect(carousel).toHaveAttribute('data-interval', 'off');
  fireEvent.mouseLeave(carousel); expect(carousel).toHaveAttribute('data-interval', '5000');
  fireEvent.click(screen.getByRole('button', { name: 'Pause slides' }));
  expect(carousel).toHaveAttribute('data-interval', 'off');
});
