# Admin capabilities

## Current

| Capability | Status | Notes |
| --- | --- | --- |
| Product list/create/edit/delete | Implemented | Server enforces admin middleware, validates mutations, and accepts stock `0` |
| Order list | Available | Admin-only API/screen |
| System observability | Available | `/admin/observability` shows safe live process/API/MongoDB/Redis/cache status and charts; it is not business analytics or persistent monitoring |
| Mark delivered | Implemented | Admin-only endpoint stores `isDelivered`, sets `deliveredAt`, and returns the updated order |
| User list/detail/update/delete | Implemented | Admin-only routes/screens; safe user fields only, duplicate-email control, and self-delete protection |

## Planned business dashboard

Overview: total revenue, total orders, customers, products, average order value. Sales: revenue/orders over time, top products/categories. Inventory: low/out-of-stock and total stock. Customers: new/repeat counts. Settings: store/contact, tax, shipping, low-stock threshold. Finance can report payment/revenue, but not profit until cost/COGS data exists.

These need reliable order/payment/delivery data and server-side aggregates first.
