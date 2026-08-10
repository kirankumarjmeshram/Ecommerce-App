# Razorpay payment flow

## Implemented

Razorpay Standard Checkout supports the current INR order-payment flow.

1. A signed-in owner (or admin) requests `POST /api/payments/razorpay/order/:id`.
2. The API rejects missing configuration, nonexistent orders, unauthorized users, already-paid orders, or an invalid total.
3. The API converts the MongoDB order total to integer paise and creates a Razorpay order.
4. React loads Razorpay Checkout and opens it using the provider order id and **Key ID** returned by the API.
5. On success, React posts provider order id, payment id, and signature to `/api/payments/razorpay/verify`.
6. The API computes HMAC-SHA256 of `razorpay_order_id|razorpay_payment_id` with the **Key Secret**, uses timing-safe comparison, then records verified payment metadata and marks the MongoDB order paid.

```text
₹ total -> Math.round(total * 100) paise -> Razorpay order
```

The Key ID may be used by browser checkout. The Key Secret is backend-only and must never enter client code, a frontend build variable, or documentation examples.

## Planned hardening

- Verify Razorpay webhooks using a separate webhook secret.
- Define idempotency/reconciliation for delayed or duplicate provider events.
- Support refunds and payment capture/settlement status as requirements demand.
- Recompute order totals server-side before payment order creation.

Use Razorpay test credentials and test payment methods only in a non-production environment. Rotate credentials that have been exposed.
