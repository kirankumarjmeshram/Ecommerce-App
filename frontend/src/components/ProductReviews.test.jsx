import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductReviews from './ProductReviews';

let mockUserInfo;
const mockRemove = jest.fn(() => ({ unwrap: () => Promise.resolve({}) }));
jest.mock('react-redux', () => ({ useSelector: (selector) => selector({ auth: { userInfo: mockUserInfo } }) }));
jest.mock('../slices/productsApiSlice', () => ({
  useGetReviewEligibilityQuery: () => ({ data: { state: 'reviewed' }, refetch: jest.fn() }),
  useSaveReviewMutation: () => [jest.fn(), { isLoading: false }],
  useDeleteReviewMutation: () => [mockRemove, { isLoading: false }],
}));

const product = { _id: 'product-1', rating: 4, numReviews: 1, reviews: [{ _id: 'review-1', user: 'owner-1', name: 'Buyer', title: 'Solid', comment: 'Works well.', rating: 4, verifiedPurchase: true }] };
const show = () => render(<MemoryRouter><ProductReviews product={product} /></MemoryRouter>);
beforeEach(() => { mockUserInfo = { _id: 'owner-1', isAdmin: false }; mockRemove.mockClear(); jest.spyOn(window, 'confirm').mockReset(); });

test('owner delete requires confirmation and cancellation does not mutate', () => {
  window.confirm.mockReturnValue(false); show();
  fireEvent.click(screen.getByRole('button', { name: 'Delete Review' }));
  expect(window.confirm).toHaveBeenCalledWith('Delete this review?'); expect(mockRemove).not.toHaveBeenCalled();
});

test('owner confirmation invokes review deletion', async () => {
  window.confirm.mockReturnValue(true); show();
  fireEvent.click(screen.getByRole('button', { name: 'Delete Review' }));
  await waitFor(() => expect(mockRemove).toHaveBeenCalledWith({ productId: 'product-1', reviewId: 'review-1' }));
});

test('admin can delete but cannot edit; another customer has no moderation controls', () => {
  window.confirm.mockReturnValue(true); mockUserInfo = { _id: 'admin-1', isAdmin: true }; const { unmount } = show();
  expect(screen.getByRole('button', { name: 'Delete Review' })).toBeInTheDocument(); expect(screen.queryByRole('button', { name: 'Edit Review' })).not.toBeInTheDocument(); unmount();
  mockUserInfo = { _id: 'other-1', isAdmin: false }; show();
  expect(screen.queryByRole('button', { name: 'Delete Review' })).not.toBeInTheDocument(); expect(screen.queryByRole('button', { name: 'Edit Review' })).not.toBeInTheDocument();
});
