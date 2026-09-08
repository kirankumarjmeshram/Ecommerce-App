import { act, render, screen } from '@testing-library/react';
import OrderTimeline from './OrderTimeline';
import useReducedMotion from '../hooks/useReducedMotion';

test.each([
  [{}, 1], [{ isPaid: true }, 2],
  [{ isPaid: true, processingAt: '2026-01-01', orderStatus: 'Processing' }, 3],
  [{ isPaid: true, processingAt: '2026-01-01', shippedAt: '2026-01-02', orderStatus: 'Shipped' }, 4],
  [{ isPaid: true, processingAt: '2026-01-01', shippedAt: '2026-01-02', isDelivered: true }, 5],
  [{ isPaid: true, isDelivered: true }, 3],
])('timeline uses actual flags/timestamps: %j', (order, completed) => {
  const { container } = render(<OrderTimeline order={order} />);
  expect(container.querySelectorAll('li.complete')).toHaveLength(completed);
});

test('reduced motion follows system changes and removes its listener', () => {
  const original = window.matchMedia;
  let change;
  const remove = jest.fn();
  const media = { matches: true, addEventListener: jest.fn((event, listener) => { change = listener; }), removeEventListener: remove };
  window.matchMedia = jest.fn(() => media);
  const Probe = () => <span>{useReducedMotion() ? 'Reduced' : 'Normal'}</span>;
  const { unmount } = render(<Probe />);
  expect(screen.getByText('Reduced')).toBeInTheDocument();
  act(() => { media.matches = false; change(); });
  expect(screen.getByText('Normal')).toBeInTheDocument();
  unmount(); expect(remove).toHaveBeenCalledWith('change', change);
  window.matchMedia = original;
});
