# Data model

```text
User 1 --- * Product     (Product.user)
User 1 --- * Order       (Order.user)
Order 1 --- * orderItems (embedded product snapshots)
Product 1 --- * reviews  (embedded reviewer references)
```

## User

Important fields: `name`, unique `email`, hashed `password`, `isAdmin`, plus timestamps. Passwords are bcrypt-hashed in a pre-save hook and omitted when a user is loaded by authentication middleware.

User identity fields use Mongoose `required` validation. Password hashes remain server-only and are excluded from user-management responses.

## Product

Fields include owning `user`, `name`, `image`, `brand`, `category`, `description`, reviews, rating, review count, `price`, and `countInStock`, plus timestamps. Name/image/brand/category/description use required validation. The only explicit index visible in the model is the User email unique index; MongoDB creates the referenced indexes as configured by Mongoose.

## Order

An order references `user`, embeds `orderItems`, shipping address, payment method/result, item/tax/shipping/total prices, and paid/delivered timestamps. `paymentResult` includes Razorpay provider/order/payment/signature information after the payment flow.

**Order delivery:** the schema, controller, and UI consistently use `isDelivered` with `deliveredAt`. Order item fields use Mongoose `required` validation.

Never place database connection strings or exported production data in this documentation.
