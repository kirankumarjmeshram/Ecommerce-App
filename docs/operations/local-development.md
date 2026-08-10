# Local development

## Prerequisites

- Node.js and npm compatible with repository dependencies.
- MongoDB Atlas network/database access, or a configured local MongoDB URI.
- Optional Redis: local Docker or managed Redis TCP/TLS endpoint.
- Razorpay test keys to exercise checkout.

## Configure

Create a root `.env` from the variable reference. Do not commit it.

```ini
NODE_ENV=development
PORT=5001
CLIENT_URL=http://localhost:3000
MONGO_URI=<mongodb-connection-string>
JWT_SECRET=<long-random-secret>
REDIS_URL=redis://127.0.0.1:6379
REDIS_PRODUCT_TTL=300
RAZORPAY_KEY_ID=<test-key-id>
RAZORPAY_KEY_SECRET=<test-key-secret>
```

Install dependencies from the repository root:

```powershell
npm install
npm run dev
```

This starts Express through nodemon and the React development server concurrently. Current defaults are API `http://localhost:5001` and frontend `http://localhost:3000`.

## Redis options

```powershell
docker run --name ecommerce-redis -p 6379:6379 -d redis
docker start ecommerce-redis
docker stop ecommerce-redis
```

For managed Redis, supply the Redis TCP/TLS URL (`rediss://...` when TLS is required), not an HTTP REST endpoint. Redis is optional for application availability; product reads fall back to MongoDB.

## Useful scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start server and client concurrently |
| `npm run server` | Start only nodemon backend |
| `npm run client` | Start only React app |
| `npm start` | Start backend without nodemon |
| `npm run data:import` / `data:destroy` | Run seeder operations; handle with care |

The data scripts use `backend/seeder.js`; keep it and real seed credentials out of Git.
