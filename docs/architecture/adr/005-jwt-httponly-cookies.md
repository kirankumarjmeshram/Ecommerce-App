# ADR-005: Use JWTs in HttpOnly cookies

**Status:** Accepted

## Context

Browser auth requires a token transport that JavaScript cannot read directly.

## Decision

Issue a signed JWT in an HttpOnly cookie and send authenticated cross-origin requests with credentials.

## Consequences

Client code does not receive the token, but cookie/CORS/CSRF posture must be maintained deliberately.
