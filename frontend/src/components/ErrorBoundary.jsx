import { Component } from 'react';

export const RenderErrorFallback = () => <main className="container store-main">
  <div className="empty-state" role="alert"><p className="eyebrow">ShopSphere</p><h1>Something went wrong</h1>
    <p>We couldn't display this page. Please reload or return home.</p>
    <div className="d-flex gap-2 justify-content-center flex-wrap"><a href="/" className="btn btn-primary">Go home</a><button className="btn btn-light" onClick={() => window.location.reload()}>Reload page</button></div>
  </div>
</main>;

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== 'production') console.error('ShopSphere rendering error', error, info);
    else console.error('ShopSphere rendering error; reload the page to recover.');
  }
  render() { return this.state.hasError ? <RenderErrorFallback /> : this.props.children; }
}
export default ErrorBoundary;
