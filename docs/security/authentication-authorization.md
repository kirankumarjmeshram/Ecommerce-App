# Authentication and authorization

## Current authentication

1. Registration/login validates credentials against the User model.
2. The API signs a 30-day JWT and sets it in an HttpOnly `jwt` cookie (`Secure` in production, `SameSite=Strict`).
3. React receives non-secret user information and stores it for routing/UI state.
4. RTK Query sends requests with browser credentials.
5. `protect` verifies the cookie and loads the current user; `admin` requires `isAdmin`.

The backend configures CORS for `CLIENT_URL` with `credentials: true`. Frontend-side route guards improve UX, but API middleware is the authorization source of truth.

## Semantics

- **401 Unauthorized:** absent, invalid, expired authentication, or a JWT whose user no longer exists.
- **403 Forbidden:** a valid non-admin user reaches an admin-only endpoint.

## Sensitive configuration

Keep `JWT_SECRET`, MongoDB URI credentials, Razorpay secret, and Redis URLs/passwords server-only in `.env`. They must be ignored by Git and never logged. Razorpay Key ID is intentionally returned only when creating checkout options; its Key Secret remains server-only.

Order detail and Razorpay payment actions enforce order-owner or admin access server-side. Order totals and provider amounts use server-calculated order data rather than browser-provided totals.

See [security notes](security-notes.md) for remediation priorities.
