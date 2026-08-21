# Test strategy

## Current status

There is no meaningful backend automated test suite. The frontend retains the default CRA `App.test.js`, which does not test the mounted application flow and is likely stale. Manual development checks are currently practical validation.

## Planned levels

1. **Unit:** model helpers, price calculation, cache keys/serialization, Razorpay signature comparison.
2. **API integration:** cookie authentication, role checks, CRUD, order ownership, server totals, and errors with test database/provider mocks.
3. **Redis:** miss/hit, TTL, create/update/delete invalidation, malformed cache data, outage fallback.
4. **Payment:** invalid amount, unauthorized payment, provider failure, valid/invalid/duplicate verification, then webhook cases.
5. **Frontend/E2E:** protected/admin routing, cart-to-checkout, payment cancel/failure, and verified paid status.

Prioritize P0 fixes with regression tests. Never use production credentials or real payment data.

## Core functionality manual regression checklist

Run this checklist locally after starting the API and frontend; use separate customer accounts plus an admin account.

1. Confirm anonymous protected requests return `401`, and a customer request to an admin endpoint returns `403`.
2. As an admin, create a product, edit it, set `countInStock` to `0`, and delete it. Check product list/detail responses change from cache `MISS` to `HIT`, then return to `MISS` after mutation.
3. As a customer, add valid quantities to a cart, create an order, and confirm the returned totals match MongoDB product prices rather than altered browser totals.
4. Attempt to create an order with an unavailable quantity and confirm it returns `400`.
5. With a second customer, request the first customer's order ID and confirm `403`; confirm admin access succeeds.
6. Create and verify a Razorpay test payment. Submit an invalid signature and confirm `400`; retry a paid order and confirm it is not marked paid twice.
7. As an admin, mark a paid order delivered and confirm `isDelivered` plus `deliveredAt` appear in order detail/list/profile history.
8. Log out, sign in as another user, and confirm the previous account's cart is not displayed.
9. Confirm `/health`, `/ready`, `/metrics`, and `/admin/observability` respond after exercising product cache requests.
