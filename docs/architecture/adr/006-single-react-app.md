# ADR-006: Keep customer and admin UI in one React application

**Status:** Accepted

## Context

Customer and admin workflows share products, orders, authentication, and deployment needs.

## Decision

Use route guards and API authorization within the existing React app rather than microfrontends.

## Consequences

Shared tooling stays simple. Admin routes must be kept aligned with server-side authorization.
