# ADR-001: Keep a modular monolith

**Status:** Accepted

## Context

The project is one Express API with one React application and has portfolio-scale operational needs.

## Decision

Keep one deployable backend and progressively organize by feature rather than introduce microservices.

## Consequences

Deployment and local development remain simple. Module boundaries must be maintained as the codebase grows; independent scaling is deferred.
