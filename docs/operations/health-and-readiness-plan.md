# Health and readiness

## Implemented

| Endpoint | Meaning | Status behavior |
| --- | --- | --- |
| `GET /health` | Node process liveness | `200` whenever Express can respond; does not probe dependencies |
| `GET /ready` | Ability to serve primary traffic | `200 ready` with MongoDB/Redis up; `200 degraded` with MongoDB up and Redis down; `503 not_ready` with MongoDB down |

MongoDB is required because it is the source of truth for users, products, and orders. Redis is optional caching infrastructure, so an unavailable Redis connection is reported as degraded rather than failing readiness. Neither endpoint exposes connection URLs, credentials, or provider error detail.

Local endpoints:

- `http://localhost:5001/health`
- `http://localhost:5001/ready`
- `http://localhost:5001/metrics`
