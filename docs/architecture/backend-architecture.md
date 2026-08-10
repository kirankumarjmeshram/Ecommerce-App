# Backend architecture

`backend/server.js` loads environment variables, connects MongoDB, starts Redis connection without blocking server startup, configures JSON/cookie parsing and credentialed CORS, mounts routes, then applies error middleware.

## Current structure

| Layer | Location | Responsibility |
| --- | --- | --- |
| Routes | `backend/routes/` | URL and middleware mapping |
| Controllers | `backend/controllers/` | Request handling and persistence orchestration |
| Models | `backend/models/` | Mongoose schemas for User, Product, Order |
| Middleware | `backend/middleware/` | JWT cookie authentication, admin checks, errors |
| Config | `backend/config/` | MongoDB, Redis, Razorpay clients |
| Utilities | `backend/utils/productCache.js` | Cache-aside read/write/invalidation helpers |

This is classic MVC with cross-cutting logic in configuration and utility modules. It is not currently divided into independently deployable services.

## Middleware and errors

`protect` reads the `jwt` HttpOnly cookie, verifies it, and loads the user. `admin` requires `req.user.isAdmin`. The not-found/error middleware returns JSON and exposes a stack in development. Controllers generally use `express-async-handler`.

## Integrations

- MongoDB connection failure stops API startup.
- Redis is optional: an invalid/unavailable connection leaves product requests functional via MongoDB.
- Razorpay client creation reads environment keys on demand. Payment verification is server-side.

## Planned direction

Keep one deployable application while grouping route/controller/model work into feature modules, adding validation and service boundaries where complexity requires it. See [ADR-001](adr/001-modular-monolith.md). This is a recommendation, not an existing refactor.
