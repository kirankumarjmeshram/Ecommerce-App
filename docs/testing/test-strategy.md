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
