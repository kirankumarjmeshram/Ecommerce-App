# API overview

The Express API is mounted by `backend/server.js` on port `5001` by default. All documented paths below are current routes; there is no `/health`, `/ready`, cart API, search API, pagination API, or public webhook route today.

Authentication is cookie-based. Send browser requests with credentials. `401` means no valid authenticated user; `403` means the authenticated user is not an administrator.

See [endpoint inventory](endpoints.md) for request/response and known-issue details.
