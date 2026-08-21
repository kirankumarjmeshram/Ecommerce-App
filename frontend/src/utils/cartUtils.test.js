import { getCartStorageKey, getStoredCart, updateCart } from './cartUtils';

beforeEach(() => localStorage.clear());

test('cart storage is isolated per signed-in user', () => {
  const userACart = { ownerId: 'user-a', cartItems: [{ _id: 'product-a', qty: 1, price: 100 }], shippingAddress: {}, paymentMethod: '' };
  updateCart(userACart);
  expect(getCartStorageKey('user-a')).not.toBe(getCartStorageKey('user-b'));
  expect(getStoredCart('user-a').cartItems).toHaveLength(1);
  expect(getStoredCart('user-b')).toBeNull();
});
