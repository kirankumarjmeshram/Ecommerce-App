import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import Rating from '../components/Rating';
import { useGetProductDetailQuery } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import ApiError from '../components/ApiError';
import StatusBadge from '../components/StatusBadge';
import formatCurrency from '../utils/formatCurrency';
import { addToCart } from '../slices/cartSlice';
import ProductReviews from '../components/ProductReviews';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const { data: product, isLoading, error, refetch } = useGetProductDetailQuery(productId);
  const addToCartHandler = () => { dispatch(addToCart({ ...product, qty })); navigate('/cart'); };
  return (
    <>
      <Link className="back-link" to="/products">← Back to collection</Link>
      {isLoading ? <Loader /> : error ? [400, 404].includes(error.status) ? <div className="empty-state"><h1>Product not found</h1><p>This product is unavailable or the link is incorrect.</p><a href="/products" className="btn btn-primary">Back to products</a></div> : <ApiError error={error} title="Unable to load this product" onRetry={refetch} /> : (
        <><Row className="g-4 g-lg-5 product-detail">
          <Col lg={6}><div className="detail-image"><img src={product.image} alt={product.name} /></div></Col>
          <Col lg={6}><div className="detail-copy">
            <p className="eyebrow">{product.brand} / {product.category}</p><h1>{product.name}</h1>
            <Rating value={product.rating} text={`${product.numReviews} reviews`} />
            <p className="detail-price">{formatCurrency(product.price)}</p>
            <StatusBadge positive={product.countInStock > 0}>{product.countInStock > 0 ? 'In stock' : 'Out of stock'}</StatusBadge>
            <p className="detail-description">{product.description}</p>
            <div className="purchase-controls">
              {product.countInStock > 0 && <Form.Group controlId="product-quantity"><Form.Label>Quantity</Form.Label><Form.Select value={qty} onChange={(e) => setQty(Number(e.target.value))}>{Array.from({ length: product.countInStock }, (_, x) => <option key={x + 1} value={x + 1}>{x + 1}</option>)}</Form.Select></Form.Group>}
              <Button disabled={product.countInStock === 0} onClick={addToCartHandler}>Add to cart <span aria-hidden="true">→</span></Button>
            </div>
            <div className="purchase-note"><strong>Secure payment via Razorpay</strong><p>Available payment methods appear at checkout. Follow your order status from your account.</p></div>
          </div></Col>
        </Row><ProductReviews key={product._id} product={product} /></>
      )}
    </>
  );
};
export default ProductScreen;
