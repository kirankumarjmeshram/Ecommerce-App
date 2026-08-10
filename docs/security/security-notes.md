# Security notes

## Current controls

- Passwords use bcrypt hashing.
- JWTs are transported in HttpOnly cookies.
- API authorization uses `protect` and `admin` middleware.
- Razorpay payment data is HMAC-verified before `isPaid` is set.
- Redis/Mongo/Razorpay credentials are environment variables and `.gitignore` excludes sensitive files.

## Priority remediation

### P0 — fix before exposing the application

1. `backend/test.js` logs `MONGO_URI`. Remove/redact it and ensure it is not used in production tooling.
2. `GET /api/orders/:id` only requires login; it does not verify that the requester owns the order or is admin. Enforce order ownership.

### P1 — harden correctness and the attack surface

- Calculate order prices/totals server-side from trusted product records; do not trust client totals.
- Fix delivery field/controller mismatches and return a response from delivery updates.
- Add request validation, payload limits appropriate to the app, rate limiting, and security headers.
- Avoid returning development stack traces outside trusted local development.
- Audit seed/demo data and rotate any credential ever exposed in chat, screenshots, commits, or logs.

### Admin user-management controls

- Admin user list/detail/update/delete APIs require both `protect` and `admin` middleware.
- Responses explicitly omit password hashes; updates whitelist only `name`, `email`, and `isAdmin`.
- Emails are trimmed/lowercased, validated, and duplicate emails return a controlled `400` response.
- An administrator cannot delete their own current account. User deletion does not cascade to orders.

### Planned payment hardening

Signature verification exists, but Razorpay webhooks, reconciliation, refund workflow, and a formal idempotency policy are not implemented.

Never log passwords, JWTs, cookie headers, connection strings, Redis URLs, Razorpay secrets, full payment identifiers, or raw payment payloads.
