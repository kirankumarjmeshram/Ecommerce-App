# System overview

## Current architecture

The application is a single React client and a single Node.js/Express API. It currently follows a classic MVC-style backend: Express routes call controllers, which use Mongoose models and supporting config/utilities. It is not yet a service-oriented modular monolith.

```text
Customer or admin browser
        |
React 18 + React Router + Redux Toolkit / RTK Query
        |  HTTP requests with cookies (`credentials: include`)
        v
Express API (:5001)
  |-- controllers + middleware
  |-- MongoDB Atlas via Mongoose       (source of truth)
  |-- Redis via node-redis             (optional product-read cache)
  `-- Razorpay SDK / Checkout          (payment provider)
```

### Responsibilities and ownership

- **React** renders customer/admin screens, holds non-secret session information and a browser-local cart, and uses RTK Query for server requests.
- **Express** authenticates cookies, authorizes roles, performs product/order/payment work, and owns payment-secret access.
- **MongoDB** owns users, products, reviews, orders, payment-result metadata, and durable order state.
- **Redis** holds disposable product detail/list representations only. A miss or outage falls back to MongoDB.
- **Razorpay** creates provider payment orders and hosts checkout. The API verifies the returned signature before marking an order paid.

### Customer and admin separation

The frontend has `PrivateRoute` for signed-in users and `AdminRoute` for users whose saved `userInfo.isAdmin` is true. The API remains the authoritative boundary: product writes, all-order access, and delivery updates use `protect` and `admin` middleware. UI gating is not sufficient authorization.

### Trust boundaries

- Browser-to-API: cross-origin cookie transport is allowed only for `CLIENT_URL` and uses credentials.
- API-to-Mongo/Redis/Razorpay: server-side environment variables supply credentials. They must never be bundled into the React app.
- Payment completion: Razorpay Checkout data is untrusted until the API validates its HMAC signature.

See [data flow](data-flow.md) for request sequences and [security notes](../security/security-notes.md) for current gaps.
