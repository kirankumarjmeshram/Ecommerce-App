import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="store-footer">
    <Container>
      <div className="footer-grid">
        <div><Link to="/" className="footer-brand">ShopSphere.</Link><p>Thoughtful finds for your everyday.</p><small>A MERN ecommerce portfolio project.</small></div>
        <div><h2>Explore</h2><Link to="/products">All products</Link><Link to="/cart">Your cart</Link><Link to="/profile">Your account</Link></div>
        <div><h2>Checkout with confidence</h2><p>Payments powered by Razorpay.</p><p>Available methods are shown at checkout.</p><Link to="/profile">View your order status</Link></div>
        <div><h2>Behind the store</h2><a href="https://github.com/kirankumarjmeshram/Ecommerce-App">Explore the project ↗</a><p>Built with React and Node.js.</p></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} ShopSphere</span><span>Designed for everyday discovery.</span></div>
    </Container>
  </footer>
);
export default Footer;
