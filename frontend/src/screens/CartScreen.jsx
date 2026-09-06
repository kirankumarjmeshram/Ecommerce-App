import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FaTrash, FaShoppingBag } from 'react-icons/fa';
import PageHeader from '../components/PageHeader';
import formatCurrency from '../utils/formatCurrency';
import { addToCart, removeFromCart } from '../slices/cartSlice';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
  return (
    <>
      <PageHeader title="Your shopping bag" description="Your favourites, ready for the next step." />
      {cartItems.length === 0 ? <div className="empty-state"><FaShoppingBag aria-hidden="true" /><h2>A little empty, a lot of possibility.</h2><p>Explore the collection and find something for your everyday.</p><Link className="btn btn-primary" to="/">Continue shopping →</Link></div> : (
        <Row className="g-4">
          <Col lg={8}><div className="cart-items">{cartItems.map((item) => (
            <article className="cart-item" key={item._id}>
              <Link to={`/product/${item._id}`}><img src={item.image} alt={item.name} /></Link>
              <div className="cart-item-info"><p className="eyebrow">{item.brand}</p><Link to={`/product/${item._id}`}>{item.name}</Link><p>{formatCurrency(item.price)}</p></div>
              <Form.Group controlId={`quantity-${item._id}`}><Form.Label>Qty</Form.Label><Form.Select value={item.qty} onChange={(e) => dispatch(addToCart({ ...item, qty: Number(e.target.value) }))}>{Array.from({ length: item.countInStock }, (_, x) => <option key={x + 1} value={x + 1}>{x + 1}</option>)}</Form.Select></Form.Group>
              <Button variant="light" aria-label={`Remove ${item.name} from cart`} onClick={() => dispatch(removeFromCart(item._id))}><FaTrash aria-hidden="true" /></Button>
            </article>
          ))}</div><Link className="back-link" to="/">← Continue shopping</Link></Col>
          <Col lg={4}><Card className="order-summary"><Card.Body><h2>Order summary</h2><div className="summary-line"><span>Items</span><span>{count}</span></div><div className="summary-line summary-total"><span>Subtotal</span><strong>{formatCurrency(cartItems.reduce((sum, item) => sum + item.price * item.qty, 0))}</strong></div><p className="text-muted small">Shipping and tax are shown when you review your order.</p><Button className="w-100" onClick={() => navigate('/login?redirect=/shipping')}>Proceed to checkout →</Button><p className="purchase-note mb-0">Secure payment via Razorpay</p></Card.Body></Card></Col>
        </Row>
      )}
    </>
  );
};
export default CartScreen;
