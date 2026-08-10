# Health and readiness plan (planned)

These endpoints do **not** exist today.

| Endpoint | Intended meaning | Dependencies |
| --- | --- | --- |
| `GET /health` | Node process can accept requests | None; no external probes |
| `GET /ready` | Safe to serve primary traffic | MongoDB required; Redis may be degraded |

MongoDB is required because it is the source of truth for user, product, and order operations. Redis should appear as `degraded` rather than make readiness fail: product reads fall back to MongoDB. Do not include connection strings or provider errors in either response.
