# Endpoint inventory

Response shapes below are representative rather than schemas; current controllers return Mongoose documents/arrays in several cases.

## System

| Method | Path | Auth / admin | Purpose | Body / response | Known issues |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | Public | Basic API welcome response | `{ message }` | No health/readiness endpoint |

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
| POST | `/api/products` | Protected + admin | Create product | product fields -> product | `countInStock` is initialized to 0 even if supplied |
| PUT | `/api/products/:id` | Protected + admin | Update product | product fields -> product | `||` updates make setting numeric fields to 0 unreliable |
| DELETE | `/api/products/:id` | Protected + admin | Delete product | `{ message }` | — |

## Orders

| Method | Path | Auth / admin | Purpose | Body / response | Known issues |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/orders` | Protected | Create order | items, address, method, totals -> order | Client provides prices/totals; missing `orderItems` can error |
| GET | `/api/orders/myorders` | Protected | Current user's orders | -> array | — |
| GET | `/api/orders/:id` | Protected | Order detail | -> order | Does not enforce owner/admin access: P0 |
| GET | `/api/orders` | Protected + admin | List all orders | -> array | — |
| PUT | `/api/orders/:id/deliver` | Protected + admin | Mark delivered | -> intended order update | Schema/property mismatch and controller sends no response |

## Payments

| Method | Path | Auth / admin | Purpose | Body / response | Known issues |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/payments/razorpay/order/:id` | Protected | Create Razorpay provider order | -> key id, Razorpay order id, amount, currency | Owner/admin and unpaid checks exist |
| POST | `/api/payments/razorpay/verify` | Protected | Verify Checkout result | `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` -> paid order | No webhook/reconciliation yet |

## Admin observability

| Method | Path | Auth / admin | Purpose | Body / response | Known issues |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/admin/observability/summary` | Protected + admin | Safe current-process operational summary for the admin UI | -> statuses, process uptime/runtime, HTTP/cache totals, bounded live history | Counters/history reset on backend restart; no P95 or persistent data |
