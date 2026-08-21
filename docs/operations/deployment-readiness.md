# Deployment readiness

## Target architecture

Deploy the React SPA separately from the Express API: Netlify serves `frontend/build`; Render runs the `backend` service. MongoDB Atlas, Upstash Redis, and Razorpay stay backend-only dependencies.

## Provider configuration

| Component | Root directory | Build command | Start/publish |
| --- | --- | --- | --- |
| Netlify frontend | `frontend` | `npm ci && npm run build` | Publish `build` |
| Render backend | `backend` | `npm ci` | `npm start` |

The included `frontend/public/_redirects` is copied into CRA's build output and makes React Router refreshes resolve to `index.html`. It is for Netlify. If Vercel is selected instead, add one Vercel-specific rewrite configuration at deployment time rather than maintaining both configurations now.

## Environment matrix

| Variable | Runtime | Local value | Production value | Secret |
| --- | --- | --- | --- | --- |
| `REACT_APP_API_URL` | Frontend build | `http://localhost:5001` | Render API origin, e.g. `https://api.example.onrender.com` | No |
| `NODE_ENV` | Backend | `development` | `production` | No |
| `PORT` | Backend | `5001` | supplied by Render | No |
| `CLIENT_URL` | Backend | `http://localhost:3000` | exact Netlify/Vercel origin | No |
| `MONGO_URI` | Backend | development Atlas/local URI | Atlas production URI | Yes |
| `JWT_SECRET` | Backend | local random secret | distinct long random secret | Yes |
| `RAZORPAY_KEY_ID` | Backend | test key | test/live key as appropriate | Treat as sensitive |
| `RAZORPAY_KEY_SECRET` | Backend | test secret | live secret as appropriate | Yes |
| `REDIS_URL` | Backend | optional local/Upstash URI | Upstash `rediss://` URI | Yes |
| `REDIS_PRODUCT_TTL` | Backend | `300` | chosen TTL | No |

Use the committed `.env.example` files as placeholders only. Never commit `.env` files or inject backend secrets into CRA variables.

## CORS and cookies

The API allows one exact `CLIENT_URL` origin and enables credentials. Wildcard CORS must not be used with cookies.

Local development uses an HttpOnly, non-secure, `SameSite=Strict` cookie. Production uses an HttpOnly, `Secure`, `SameSite=None` cookie so a Netlify/Vercel frontend can send it to a separate Render domain. Login and logout use matching cookie options.

## Operations endpoints

- `GET /health` is public and suitable for a future Render health check.
- `GET /ready` is public: MongoDB must be up; Redis may be reported as degraded because cache fallback is intentional.
- `GET /metrics` is public today. Restrict it at the network/proxy layer before exposing a public production API if metrics disclosure is not acceptable.
- `/api/admin/observability/*` remains protected by application admin middleware.

Pino request logging redacts cookie and authorization headers. The API uses `process.env.PORT` and does not bind to localhost-only.

## Manual deployment verification

1. Deploy the backend first; verify `/health` is `200` and `/ready` is `ready` or intentionally `degraded`.
2. Set the frontend `REACT_APP_API_URL` to that backend origin and deploy the SPA.
3. Set backend `CLIENT_URL` to the exact frontend origin, then redeploy the backend.
4. Register/login from the deployed frontend; confirm the browser stores the Secure, HttpOnly JWT cookie and protected requests succeed after refresh.
5. Verify admin access, logout, and that logout removes the cookie.
6. Check a random browser origin is rejected by CORS; the allowed frontend origin works with credentials.
7. Verify SPA refreshes on `/admin/userlist` and `/order/<id>`.
8. Use Razorpay test mode before any live key; do not expose `RAZORPAY_KEY_SECRET`.

## Later hardening

Helmet, endpoint rate limiting, and a private metrics policy are P2 deployment/security improvements. Source maps retain CRA defaults and have not been disabled.
