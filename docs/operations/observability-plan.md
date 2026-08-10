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

## Implemented: Phase 2 admin live dashboard

`GET /api/admin/observability/summary` is a JSON endpoint protected by the existing `protect` and `admin` middleware. It is consumed by the admin-only React route `/admin/observability`; React does not fetch or parse `/metrics`.

The summary exposes only safe operational values: overall/API/MongoDB/Redis status, uptime, HTTP request and `5xx` totals/error rate/average latency, Redis hit/miss/error totals and ratio, process RSS memory, Node.js version, and a bounded rolling request history.

The rolling history stores at most 60 one-minute buckets in backend process memory. It is intentionally live-only, bounded, and reset by backend restart. It is not historical monitoring storage. Recharts charts display genuine requests, average latency, `5xx` errors, and Redis hit/miss activity when live data exists.

The dashboard does not expose raw logs, Prometheus text, environment variables, credentials, or payment/authentication data. P95 latency is not shown: it should be calculated later in Prometheus/Grafana with `histogram_quantile`.

## Planned: later phases

1. Grafana Cloud dashboards, persistent storage, and production scraping.
2. Sentry error tracking.
3. Alerting and runbooks.
4. OpenTelemetry only if cross-service tracing becomes necessary.

Never log passwords, JWTs, cookies, authorization headers, MongoDB/Redis credentials, Razorpay secrets, or sensitive payment data.
