# Observability plan (planned)

No structured logging, metrics endpoint, correlation ID middleware, Grafana dashboard, or Sentry integration is implemented yet.

## First delivery scope

1. Pino structured JSON logs.
2. Request/correlation IDs.
3. `/health` and `/ready`.
4. `prom-client` HTTP and Redis cache metrics.
5. Grafana Cloud dashboards and Sentry error tracking.

## Logs and metrics

Each completion log should include request ID, method, sanitized path, status, and duration. Never log passwords, JWTs, cookies, authorization headers, MongoDB/Redis credentials, Razorpay secrets, or sensitive payment data.

Initial metrics: `http_requests_total`, `http_request_duration_seconds`, `http_errors_total`, `redis_cache_hits_total`, `redis_cache_misses_total`, and `redis_cache_errors_total`. Use route patterns/status/method labels only—never raw URLs, user IDs, or order IDs.

Grafana should surface request rate/latency/errors, cache hit ratio/errors, and Mongo readiness. Sentry should capture sanitized client/server exceptions. OpenTelemetry is a later extension if distributed tracing becomes necessary.
