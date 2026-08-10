# Engineering documentation

This folder describes the repository as it exists today. It is an onboarding and engineering reference, not a promise of future functionality.

## Start here

1. [System overview](architecture/system-overview.md) — components, dependencies, and trust boundaries.
2. [Local development](operations/local-development.md) and [environment variables](operations/environment-variables.md) — run the application safely.
3. [Current features](product/current-features.md) — implemented, partial, and missing capabilities.
4. [Roadmap](product/roadmap.md) — explicitly planned work.

## Current implementation

| Area | Document |
| --- | --- |
| Frontend, backend, and request flows | [Architecture](architecture/system-overview.md) |
| Express API inventory | [API](api/overview.md) |
| MongoDB and Redis | [Data](database/data-model.md) |
| Auth and known security concerns | [Security](security/authentication-authorization.md) |
| Razorpay payment flow | [Payments](payments/razorpay-flow.md) |
| Test status | [Testing](testing/test-strategy.md) |

## Planned architecture and operations

[Health/readiness](operations/health-and-readiness-plan.md), [observability](operations/observability-plan.md), and the [roadmap](product/roadmap.md) are plans. They are not implemented endpoints or services.

## Maintaining these docs

Update the relevant document in the same pull request as a route, model, deployment, cache, payment, or security-flow change. Record durable architectural choices in [ADRs](architecture/adr/README.md).
