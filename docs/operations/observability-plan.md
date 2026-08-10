# Observability

## Implemented: Phase 1

- Pino structured server logs with safe request serializers and redaction for cookies, authorization, passwords, and payment signatures.
- Request IDs: a reasonable incoming `X-Request-Id` is reused; otherwise `crypto.randomUUID()` creates one. Every response includes `X-Request-Id`.
- Completion logs include request ID, method, path, status, duration, and user ID after authentication where available.
- `/health`, `/ready`, and Prometheus text `/metrics` endpoints.
- Default Node process metrics plus `http_requests_total`, `http_request_duration_seconds`, `http_errors_total`, `redis_cache_hits_total`, `redis_cache_misses_total`, and `redis_cache_errors_total`.

`http_errors_total` counts only completed responses with status `500` or greater. Route labels use Express route patterns when available and otherwise `unmatched`; raw resource IDs are not metric labels. Redis metrics use only `product_list` and `product_detail` labels.

Cache hit ratio remains a Prometheus query rather than an application gauge:

```text
rate(redis_cache_hits_total[5m]) /
(rate(redis_cache_hits_total[5m]) + rate(redis_cache_misses_total[5m]))
```

`/metrics` is locally accessible for development. Production access should later be restricted by network or infrastructure controls.

## Planned: later phases

1. Grafana Cloud dashboards and production scraping.
2. Sentry error tracking.
3. Alerting and runbooks.
4. OpenTelemetry only if cross-service tracing becomes necessary.

Never log passwords, JWTs, cookies, authorization headers, MongoDB/Redis credentials, Razorpay secrets, or sensitive payment data.
