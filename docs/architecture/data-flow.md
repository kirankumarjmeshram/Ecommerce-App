# Data flow

## Login

```text
React -> POST /api/users/auth { email, password }
      -> API finds user and compares bcrypt hash
      -> API signs JWT and sets HttpOnly `jwt` cookie
      <- user info (without password)
React -> stores non-secret userInfo in Redux/localStorage
```

## Product read with Redis cache-aside

```text
React -> GET /api/products or /api/products/:id
      -> Redis GET
      -> HIT: JSON response, X-Cache: HIT
      -> MISS/error: MongoDB query -> Redis SET with TTL -> response, X-Cache: MISS
```

MongoDB remains authoritative. Product create/update/delete invalidates detail and/or list keys after a successful database write.

## Checkout and order

```text
Cart in browser -> shipping/payment selection -> POST /api/orders
                -> MongoDB Order (initially unpaid)
                <- order id
```

The current API accepts order items and totals supplied by the client. Recalculation from trusted product data is planned security/correctness work.

## Razorpay payment

```text
Order screen -> POST /api/payments/razorpay/order/:id
             -> API checks owner/admin and unpaid order
             -> Razorpay order created in INR paise
             <- key id, Razorpay order id, amount, currency
React -> Razorpay Checkout
      -> POST /api/payments/razorpay/verify
      -> API validates HMAC(order_id|payment_id)
      -> MongoDB records verified payment and isPaid=true
```

Signature verification exists today. Webhooks, reconciliation, and refund handling are **planned**.
