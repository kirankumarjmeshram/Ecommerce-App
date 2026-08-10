# Environment variables

The root `.env` is loaded by the backend. Use placeholders only; never copy real values into docs, source, screenshots, or commits.

| Variable | Purpose | Required | Scope | Secret | Placeholder format |
| --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | Runtime mode | Optional (`development`) | Backend | No | `development` / `production` |
| `PORT` | Express listen port | Optional (`5001`) | Backend | No | `5001` |
| `CLIENT_URL` | Allowed CORS frontend origin | Recommended | Backend | No | `http://localhost:3000` |
| `MONGO_URI` | Mongoose connection URL | Yes | Backend | Yes | `mongodb+srv://<user>:<password>@<cluster>/<db>` |
| `JWT_SECRET` | JWT signing secret | Yes | Backend | Yes | `<long-random-value>` |
| `REDIS_URL` | Redis TCP/TLS connection | Optional | Backend | Yes | `redis://127.0.0.1:6379` or `rediss://default:<password>@<host>:6379` |
| `REDIS_PRODUCT_TTL` | Product cache seconds | Optional (`300`) | Backend | No | `300` |
| `RAZORPAY_KEY_ID` | Checkout public key identifier | Required for payments | Backend response/browser checkout | No | `<razorpay-test-key-id>` |
| `RAZORPAY_KEY_SECRET` | Create/verify provider orders | Required for payments | Backend only | Yes | `<razorpay-test-key-secret>` |
| `RAZORPAY_WEBHOOK_SECRET` | Future webhook validation | Planned; unused | Backend | Yes | `<webhook-secret>` |

The current frontend has no environment-configured API URL; `apiSlice.js` uses the local URL directly. This is planned cleanup.
