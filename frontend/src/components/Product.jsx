import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import formatCurrency from '../utils/formatCurrency';

const Product = ({ product }) => (
  <Card className="product-card h-100">
    <Link className="product-image" to={`/product/${product._id}`}>
      <img src={product.image} alt={product.name} loading="lazy" />
    </Link>
    <Card.Body>
      <p className="eyebrow">{product.brand || product.category}</p>
      <Link className="product-title" to={`/product/${product._id}`}>{product.name}</Link>
      <Rating value={product.rating} text={`${product.numReviews} reviews`} />
      <div className="product-price-row"><strong>{formatCurrency(product.price)}</strong>
        <span className={product.countInStock > 0 ? 'stock-label' : 'text-muted'}>{product.countInStock > 0 ? 'In stock' : 'Out of stock'}</span>
      </div>
      <Link className="btn btn-outline-primary w-100" to={`/product/${product._id}`}>View product <span aria-hidden="true">↗</span></Link>
    </Card.Body>
  </Card>
);
export default Product;
