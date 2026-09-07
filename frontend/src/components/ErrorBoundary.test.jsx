import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import NotFoundScreen from '../screens/NotFoundScreen';

test('render failure shows recovery actions without stack traces', () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  const Broken = () => { throw new Error('PRIVATE_STACK_DETAIL'); };
  try {
    render(<ErrorBoundary><Broken /></ErrorBoundary>);
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeTruthy();
    expect(screen.queryByText('PRIVATE_STACK_DETAIL')).toBeNull();
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy();
    expect(log).toHaveBeenCalled();
  } finally { log.mockRestore(); }
});
test('404 provides valid recovery destinations', () => {
  render(<MemoryRouter><NotFoundScreen /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Browse products' }).getAttribute('href')).toBe('/products');
  expect(screen.getByRole('link', { name: 'Go home' }).getAttribute('href')).toBe('/');
});
