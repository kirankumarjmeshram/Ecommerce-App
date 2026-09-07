import { Link } from 'react-router-dom';

const NotFoundScreen = () => <div className="empty-state">
  <p className="eyebrow">404</p><h1>Page not found</h1><p>The page you're looking for doesn't exist.</p>
  <div className="d-flex gap-2 justify-content-center flex-wrap"><Link to="/" className="btn btn-primary">Go home</Link><Link to="/products" className="btn btn-light">Browse products</Link></div>
</div>;
export default NotFoundScreen;
