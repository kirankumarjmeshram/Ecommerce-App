# Current feature status

| Area | Status | Current state |
| --- | --- | --- |
| Authentication | Implemented, needs hardening | Register/login/logout/profile with JWT HttpOnly cookie |
| Profile | Partial | Read/update profile; delivery-field typo debt |
| Products | Implemented, needs fixes | Public list/detail; admin create/edit/delete |
| Cart | Implemented | Browser-local cart and totals |
| Checkout | Partial | Shipping/payment/place-order; totals client-provided |
| Orders | Partial | Create, user list, detail, admin list; ownership/delivery bugs |
| Razorpay payment | Implemented | Provider-order creation and signature verification |
| Admin products | Implemented, needs fixes | Inventory zero handling needs correction |
| Admin users | Not implemented | Placeholder controllers and no matching screen |
| Admin orders | Partial | Delivery update needs repair |
| Reviews/search/pagination | Not implemented | Schema has reviews but no exposed workflow/search/pagination |
| Analytics/observability/deployment | Not implemented | No dashboard, probes/metrics, or deployment setup |
