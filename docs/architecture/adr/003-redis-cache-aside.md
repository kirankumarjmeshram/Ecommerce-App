# ADR-003: Use cache-aside Redis for product reads

**Status:** Accepted

## Context

Product list/detail reads are frequent and can be served from disposable cached data.

## Decision

Read Redis before MongoDB; populate successful reads with a TTL; invalidate affected keys after product writes.

## Consequences

Read latency may improve while MongoDB remains correct. Cache invalidation and outage fallback require testing.
