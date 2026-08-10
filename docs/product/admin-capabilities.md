# Admin capabilities

## Current

| Capability | Status | Notes |
| --- | --- | --- |
| Product list/create/edit/delete | Available | Server enforces admin middleware; stock-zero handling needs repair |
| Order list | Available | Admin-only API/screen |
| Mark delivered | Partial/broken | Schema uses `isDeliverd`; controller writes `isDelivered` and does not respond |
| User list/detail/update/delete | Not implemented | Routes/controllers return placeholders; header link has no matching screen |

## Planned business dashboard

Overview: total revenue, total orders, customers, products, average order value. Sales: revenue/orders over time, top products/categories. Inventory: low/out-of-stock and total stock. Customers: new/repeat counts. Settings: store/contact, tax, shipping, low-stock threshold. Finance can report payment/revenue, but not profit until cost/COGS data exists.

These need reliable order/payment/delivery data and server-side aggregates first.
