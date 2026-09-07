import { render, screen, fireEvent } from '@testing-library/react';
import StarSelector from './StarSelector';
import PriceRangeFilter from './PriceRangeFilter';
import { clampRange, validateCatalogRange } from '../utils/priceRange';
import { fulfillmentStatus, nextFulfillment, eligibilityMessage } from '../utils/commerceState';
test('star selector offers exactly five accessible choices and selected text', () => {
  const change = jest.fn(); render(<StarSelector value={3} onChange={change} minimum />);
  expect(screen.getAllByRole('radio')).toHaveLength(5);
  expect(screen.getByRole('radio', { name: '3 stars and above' }).checked).toBe(true);
  fireEvent.click(screen.getByRole('radio', { name: '5 stars and above' })); expect(change).toHaveBeenCalledWith(5);
  fireEvent.click(screen.getByRole('button', { name: 'Clear rating' })); expect(change).toHaveBeenCalledWith('');
});
test('price fields and slider synchronize without applying each keystroke', () => {
  const apply = jest.fn(); render(<PriceRangeFilter params={new URLSearchParams()} bounds={{ min: 10, max: 100 }} onApply={apply} />);
  fireEvent.change(screen.getByLabelText('Minimum price slider'), { target: { value: '30' } });
  expect(screen.getByLabelText('Minimum price').value).toBe('30');
  fireEvent.change(screen.getByLabelText('Maximum price'), { target: { value: '80' } });
  expect(screen.getByLabelText('Maximum price slider').value).toBe('80'); expect(apply).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Apply price range' })); expect(apply).toHaveBeenCalledWith({ minPrice: '30', maxPrice: '80' });
});
test('price utilities enforce catalog bounds', () => {
  expect(clampRange(120, 10, 100)).toBe(100); expect(validateCatalogRange('0', '50', { min: 10, max: 100 })).toContain('available catalog');
  expect(validateCatalogRange('', '', { min: 10, max: 100 })).toBe('');
});
test('legacy order mapping and review eligibility copy use real state', () => {
  expect(fulfillmentStatus({ isDelivered: true })).toBe('Delivered');
  expect(nextFulfillment({ isPaid: false })).toBeNull();
  expect(nextFulfillment({ isPaid: true, orderStatus: 'Shipped' })).toBe('Delivered');
  expect(eligibilityMessage('awaiting_delivery')).toContain('delivered');
});
