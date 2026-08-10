# Frontend architecture

## Current implementation

- **Runtime:** React 18, Create React App / `react-scripts`, JavaScript.
- **Routing:** React Router 6 in `frontend/src/App.js`.
- **UI:** React Bootstrap and React Toastify.
- **State:** Redux Toolkit store in `frontend/src/store.js`.
- **Server state:** RTK Query APIs under `frontend/src/slices/`; `fetchBaseQuery` targets `http://localhost:5001/` and sends cookies with `credentials: 'include'`.
- **Browser-local state:** `authSlice` stores non-secret user information and `cartSlice` persists cart/shipping/payment data in `localStorage`.

### Routes

Public routes include home, product detail, cart, login, and registration. `PrivateRoute` protects shipping, payment, place-order, order detail, and profile screens. `AdminRoute` protects admin order/product screens. Product creation/editing are separate admin routes.

The header contains an admin users link, but no matching admin-user screen/route is implemented. Relative redirects in the guard components (`./login`) are also technical debt.

### Data access

`apiSlice.js` defines the shared RTK Query base API. Feature slices inject endpoints for products, users, and orders/payments. Product queries use RTK Query tags so mutations refetch product data; the server independently invalidates Redis data.

On API `401`, the base-query wrapper clears client storage and dispatches logout. A `403` is retained as an authorization failure rather than being treated as logout.

### Checkout state

Cart totals are calculated in `cartSlice` and stored locally. Shipping and a selected payment method are collected before the order screen. The Razorpay checkout screen dynamically loads the provider script, asks the API to create a provider order, and sends the returned payment identifiers to the API for verification.

### Current technical debt

- The API base URL is hard-coded for local development rather than environment-configured.
- `authSlice.logout` clears all `localStorage`, including cart data.
- `PaymentScreen` has a malformed hook dependency and weak empty-address detection.
- Default CRA test (`App.test.js`) is not a meaningful application test.
- Axios is installed, but active requests use RTK Query; comments/readme still reference Axios.

The desired future direction is a clearer feature-oriented frontend module layout and environment-aware API configuration; that is **planned**, not current.
