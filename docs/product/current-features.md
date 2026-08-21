# Current feature status

| Area | Status | Current state |
| --- | --- | --- |
| Authentication | Implemented | Register/login/logout/profile with JWT HttpOnly cookie and controlled 401/403 behavior |
| Profile | Implemented | Read/update profile with safe responses |
| Products | Implemented | Public list/detail; validated admin create/edit/delete; Redis invalidation |
| Cart | Implemented | Browser-local cart stored per signed-in user (or guest), with client-side totals for display |
| Checkout | Implemented | Shipping/payment/place-order; backend calculates authoritative totals from products |
| Orders | Implemented | Create, user list, owner/admin detail access, admin list, delivery update |
| Razorpay payment | Implemented | Provider-order creation and signature verification |
| Admin products | Implemented | Validates required fields and accepts zero stock |
| Admin users | Implemented | Admin-only list, detail/edit, role update, and deletion with self-delete protection |
| Admin orders | Implemented | Admin-only delivery update uses `isDelivered` and timestamp |
| Reviews/search/pagination | Not implemented | Schema has reviews but no exposed workflow/search/pagination |
| Analytics/observability | Implemented | Admin dashboard, probes, request/cache metrics, and structured logging |
| Deployment | Planned | Separate frontend/backend deployment follows the testing and CI/CD phase |
