import { Row, Col, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaShoppingBag, FaBoxOpen } from 'react-icons/fa';
import Product from '../components/Product';
import { useGetProductsQuery, useGetProductCategoriesQuery } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import ApiError from '../components/ApiError';
import { useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

const HomeScreen = () => {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const { data, isLoading, error, refetch } = useGetProductsQuery({ limit: 4, sort: 'newest' });
  const { data: categoryData, error: categoryError } = useGetProductCategoriesQuery();
  const products = data?.products || [];
  const featured = products.find((product) => product.countInStock > 0) || products[0];
  return (
    <>
      <button className="btn btn-link btn-sm" onClick={() => setPaused(!paused)} disabled={reducedMotion}>{reducedMotion ? 'Automatic slides disabled for reduced motion' : paused ? 'Play slides' : 'Pause slides'}</button>
      <Carousel fade={!reducedMotion} interval={paused || focused || reducedMotion ? null : 5000} pause="hover" onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} className="home-carousel" aria-label="ShopSphere highlights">
      <Carousel.Item><section className="store-hero" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow">The everyday edit</p>
          <h1 id="hero-title">Good finds.<br />Better everyday.</h1>
          <p>Discover essentials that fit your life. Browse the collection and find your next favourite.</p>
          <Link to="/products" className="btn btn-primary">Explore the collection <span aria-hidden="true">→</span></Link>
        </div>
        <div className="hero-feature">
          {featured ? <Link to={`/product/${featured._id}`} className="hero-product"><img src={featured.image} alt={featured.name} /><span><small>IN THE COLLECTION</small><strong>{featured.name}</strong><span aria-hidden="true">Explore ↗</span></span></Link>
            : <div className="hero-placeholder"><FaShoppingBag aria-hidden="true" /><span>Your everyday, upgraded.</span></div>}
        </div>
      </section></Carousel.Item>
      <Carousel.Item><section className="store-hero"><div className="hero-copy"><p className="eyebrow">Made for discovery</p><h2>Find your kind<br />of everyday.</h2><p>Browse categories from our current collection and narrow down your next find.</p><Link className="btn btn-primary" to="/products">Browse categories →</Link></div><div className="hero-feature hero-placeholder"><FaBoxOpen aria-hidden="true" /><span>One collection. More ways to explore.</span></div></section></Carousel.Item>
      <Carousel.Item><section className="store-hero"><div className="hero-copy"><p className="eyebrow">Checkout with confidence</p><h2>Your next find.<br />A simple checkout.</h2><p>Pay securely through Razorpay. Available payment methods are shown at checkout.</p><Link className="btn btn-primary" to="/products">Start shopping →</Link></div><div className="hero-feature hero-placeholder"><FaShieldAlt aria-hidden="true" /><span>Payments powered by Razorpay.</span></div></section></Carousel.Item>
      </Carousel>
      <div className="trust-strip">
        <div><FaShieldAlt aria-hidden="true" /><span><strong>Secure payments</strong><small>Checkout powered by Razorpay</small></span></div>
        <div><FaShoppingBag aria-hidden="true" /><span><strong>A simple checkout</strong><small>From your cart to your order</small></span></div>
        <div><FaBoxOpen aria-hidden="true" /><span><strong>Stay in the loop</strong><small>View order status in your account</small></span></div>
      </div>
      <section className="category-section" aria-labelledby="categories-title"><div className="page-heading"><h2 id="categories-title">Shop by Category</h2><Link to="/products">All Categories →</Link></div><div className="category-tiles">{categoryData?.categories.map((category) => <Link key={category} to={`/products?${new URLSearchParams({ category })}`}><FaBoxOpen aria-hidden="true" />{category}<span aria-hidden="true">↗</span></Link>)}</div>{categoryError && <p className="text-muted">Categories are temporarily unavailable.</p>}</section>
      <section id="collection" className="collection">
        <div className="page-heading"><div><p className="eyebrow">Find your next favourite</p><h2>Latest products</h2></div><Link to="/products">View All Products →</Link></div>
        {isLoading ? <Loader /> : error ? <ApiError error={error} onRetry={refetch} /> : products.length === 0 ? <div className="empty-state"><h3>The collection is on its way</h3><p>Check back soon for available products.</p></div> : (
          <Row className="g-4">{products.map((product) => <Col key={product._id} xs={12} sm={6} lg={4} xl={3}><Product product={product} /></Col>)}</Row>
        )}
      </section>
    </>
  );
};
export default HomeScreen;
