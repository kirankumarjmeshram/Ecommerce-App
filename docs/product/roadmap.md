# Roadmap

This is **planned work**, ordered from safety/correctness to portfolio operations.

| Phase | Goal | Major tasks | Definition of done |
| --- | --- | --- | --- |
| 1 | P0/P1 security/correctness | Remove sensitive logs; enforce order ownership; server totals; repair delivery | No sensitive logs and orders are authorized/correct |
| 2 | Product CRUD | Correct stock-zero semantics and validation | Admin CRUD/cache invalidation tested |
| 3 | Admin users/orders | Implement users and fulfillment | Protected endpoints/screens work |
| 4 | Payment hardening | Webhooks, reconciliation, idempotency, refunds policy | Provider events reconcile safely |
| 5 | Business dashboard | Sales, inventory, customer aggregates | Correct data and metric definitions |
| 6 | Observability | Pino, IDs, probes, metrics, Grafana/Sentry | Safe logs/dashboards work locally |
| 7 | Customer experience | Search, pagination, reviews | API/UI support each feature |
| 8 | Testing | Unit, API, frontend, Redis/payment/authorization tests | CI-runnable critical suite |
| 9 | Frontend modernization | Configurable API URL, guard/UI cleanup | Build passes with retained behavior |
| 10 | Docker/CI-CD | Reproducible containers and automated checks | Build/test checks automated |
| 11 | Deployment | Deploy with managed dependencies | Production config/probes verified |
| 12 | Portfolio polish | Root README, screenshots, demo | Documentation/demo match implementation |
