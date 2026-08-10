# ADR-002: Use MongoDB as the source of truth

**Status:** Accepted

## Context

Users, products, and orders require durable document storage; Redis data can expire.

## Decision

Persist application records in MongoDB Atlas through Mongoose. Redis is never authoritative.

## Consequences

Cache loss is recoverable through MongoDB reads. Schema correctness and database authorization are critical.
