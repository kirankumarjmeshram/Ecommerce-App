import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useGetReviewEligibilityQuery, useSaveReviewMutation, useDeleteReviewMutation } from '../slices/productsApiSlice';
import StarSelector from './StarSelector';
import Rating from './Rating';
import Message from './Message';
import getErrorMessage from '../utils/getErrorMessage';
import { eligibilityMessage } from '../utils/commerceState';

const ProductReviews = ({ product }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data, error: eligibilityError, isFetching, refetch } = useGetReviewEligibilityQuery({ productId: product._id, userId: userInfo?._id }, { skip: !userInfo, refetchOnMountOrArgChange: true });
  const [save, { isLoading: saving }] = useSaveReviewMutation();
  const [remove, { isLoading: deleting }] = useDeleteReviewMutation();
  const [editing, setEditing] = useState(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const reviews = [...(product.reviews || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const reset = () => { setEditing(null); setRating(0); setTitle(''); setComment(''); };
  return <section className="reviews-section" aria-labelledby="reviews-title">
    <div className="page-heading"><h2 id="reviews-title">Customer Reviews</h2><Rating value={product.rating} text={`${product.numReviews} reviews`} /></div>
    {message && <Message>{message}</Message>}
    {!reviews.length && <p>No written reviews yet.</p>}
    {reviews.map((review) => <article className="review-card" key={review._id}>
      <Rating value={review.rating} text={`${review.rating}/5`} /><h3>{review.title || 'Customer review'}</h3>
      {review.verifiedPurchase && <span className="status-pill status-positive">✓ Verified Purchase</span>}
      <p className="small text-muted">{review.name} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Date unavailable'}</p><p className="review-comment">{review.comment}</p>
      {String(review.user) === userInfo?._id && <Button size="sm" variant="light" onClick={() => { setEditing(review._id); setRating(review.rating); setTitle(review.title || ''); setComment(review.comment); setMessage(''); }}>Edit Review</Button>}
      {(String(review.user) === userInfo?._id || userInfo?.isAdmin) && <Button size="sm" variant="outline-danger" className="ms-2" disabled={deleting} onClick={async () => {
        if (!window.confirm('Delete this review?')) return;
        try { await remove({ productId: product._id, reviewId: review._id }).unwrap(); reset(); setMessage('Review deleted.'); } catch (error) { setMessage(getErrorMessage(error)); }
      }}>Delete Review</Button>}
    </article>)}
    {!userInfo ? <p><Link to="/login">Sign in</Link> to view your review eligibility.</p> : eligibilityError ? <Message>{getErrorMessage(eligibilityError, 'Unable to check review eligibility.')} <Button variant="link" onClick={refetch}>Retry</Button></Message> : <>
      {isFetching && <p role="status">Checking review eligibility…</p>}
      {eligibilityMessage(data?.state) && <p>{eligibilityMessage(data.state)}</p>}
      {(editing || data?.state === 'eligible') && <Form className="review-form" onSubmit={async (event) => {
        event.preventDefault();
        if (!rating) { setMessage('Please select a rating between 1 and 5.'); return; }
        try { await save({ productId: product._id, reviewId: editing, rating, title, comment }).unwrap(); reset(); setMessage('Review saved.'); } catch (error) { setMessage(getErrorMessage(error)); }
      }}><h3>{editing ? 'Edit Review' : 'Write a Review'}</h3>
        <StarSelector value={rating} onChange={setRating} label="Your Rating" />
        <Form.Group controlId="review-title"><Form.Label>Review Title</Form.Label><Form.Control required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} /></Form.Group>
        <Form.Group controlId="review-comment"><Form.Label>Your Review</Form.Label><Form.Control as="textarea" rows={4} required maxLength={2000} value={comment} onChange={(event) => setComment(event.target.value)} /></Form.Group>
        <Button type="submit" disabled={saving}>{editing ? 'Save Review' : 'Submit Review'}</Button>{editing && <Button variant="link" onClick={reset}>Cancel</Button>}
      </Form>}
    </>}
  </section>;
};
export default ProductReviews;
