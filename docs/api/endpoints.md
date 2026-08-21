# Endpoint inventory

Response shapes below are representative rather than schemas; current controllers return Mongoose documents/arrays in several cases.

## System

| Method | Path | Auth / admin | Purpose | Body / response | Known issues |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | Public | Basic API welcome response | `{ message }` | — |
| GET | `/health` | Public | Liveness probe | process status | — |
| GET | `/ready` | Public | Dependency readiness probe | MongoDB/Redis status | Redis may be degraded while MongoDB remains ready |
| GET | `/metrics` | Public | Prometheus metrics | Prometheus text format | Protect at the network layer in production if required |

## Users

| Method | Path | Auth / admin | Purpose | Body / response | Known issues |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/users` | Public | Register | `{name,email,password}` -> safe user info; sets cookie | Name/email/password are validated; email is normalized and unique |
| POST | `/api/users/auth` | Public | Login | `{email,password}` -> safe user info; sets cookie | Password is never returned or logged |
| POST | `/api/users/logout` | Public | Clear JWT cookie | `{ message }` | No server token revocation |
| GET | `/api/users/profile` | Protected | Current profile | -> user | — |
| PUT | `/api/users/profile` | Protected | Update profile | `{name,email,password?}` -> safe user | Duplicate email returns controlled `400` |
| GET | `/api/users` | Protected + admin | List users | -> safe user list sorted newest first | Password hashes excluded |
| GET | `/api/users/:id` | Protected + admin | Get one user | -> safe user | Invalid ID `400`, missing user `404` |
| PUT | `/api/users/:id` | Protected + admin | Edit name, email, role | `{name?,email?,isAdmin?}` -> safe user | Explicit field whitelist; duplicate email `400` |
| DELETE | `/api/users/:id` | Protected + admin | Delete user | `{ message }` | Current admin cannot delete their own account; orders are not cascaded |

## Products

| Method | Path | Auth / admin | Purpose | Body / response | Known issues |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/products` | Public | List products | -> array; `X-Cache` header | No search/pagination/filtering |
| GET | `/api/products/:id` | Public | Product detail | -> product; `X-Cache` header | Invalid ids follow error middleware |
| POST | `/api/products` | Protected + admin | Create product | Required text fields, non-negative price, integer `countInStock` -> product | Invalidates product-list cache |
| PUT | `/api/products/:id` | Protected + admin | Update product | Valid supplied product fields -> product | Accepts valid `0` for price/stock; invalid IDs return `400` |
| DELETE | `/api/products/:id` | Protected + admin | Delete product | `{ message }` | — |

## Orders

| Method | Path | Auth / admin | Purpose | Body / response | Known issues |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/orders` | Protected | Create order | product IDs/quantities, address, `Razorpay` -> order | Product name/image/price and all totals are calculated from MongoDB; client totals are ignored |
| GET | `/api/orders/myorders` | Protected | Current user's orders | -> array | — |
| GET | `/api/orders/:id` | Protected | Order detail | -> order | Order owner or admin only; invalid IDs `400` |
| GET | `/api/orders` | Protected + admin | List all orders | -> array | — |
| PUT | `/api/orders/:id/deliver` | Protected + admin | Mark delivered | -> updated order | Sets `isDelivered` and `deliveredAt` |

## Payments

| Method | Path | Auth / admin | Purpose | Body / response | Known issues |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/payments/razorpay/order/:id` | Protected | Create Razorpay provider order | -> key id, Razorpay order id, amount, currency | Owner/admin and unpaid checks exist |
| POST | `/api/payments/razorpay/verify/:orderId` | Protected | Verify Checkout result | `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` -> paid order | Owner/admin only; HMAC verification and duplicate-payment protection; webhook/reconciliation not yet implemented |

## Admin observability

| Method | Path | Auth / admin | Purpose | Body / response | Known issues |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/admin/observability/summary` | Protected + admin | Safe current-process operational summary for the admin UI | -> statuses, process uptime/runtime, HTTP/cache totals, bounded live history | Counters/history reset on backend restart; no P95 or persistent data |
