const localApiUrl = 'http://localhost:5001/';

// Set REACT_APP_API_URL to the deployed backend URL for production builds.
export const BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'development' ? localApiUrl : ''
);
export const PRODUCTS_URL = 'api/products';
export const USERS_URL = 'api/users';
export const ORDERS_URL = 'api/orders';
export const PAYMENTS_URL = 'api/payments';
