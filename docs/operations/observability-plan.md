# Observability

## What observability means in this application

Observability answers operational questions without inspecting the database manually or guessing from the UI:

- Is the API process running?
- Can the application reach MongoDB, its required source of truth?
- Is Redis helping product reads, or has the cache degraded safely?
- Are requests failing with server errors?
- Is the API becoming slower or using unusual memory?

```text
Browser request
   -> Express assigns X-Request-Id
   -> Pino writes a safe structured completion/error log
   -> HTTP and Redis counters/histogram are updated
   -> admin summary API exposes safe live values
   -> /admin/observability displays cards and Recharts graphs

Prometheus-compatible /metrics remains separate for future Grafana use.
```

This is system observability, not business analytics. It reports API, MongoDB, Redis, error, latency, and runtime health; it does not report sales, revenue, customers, or payments.

## How to use it locally

1. Start the application with `npm run dev`.
2. Sign in as an administrator.
3. Open `http://localhost:3000/admin/observability` from the **Admin** dropdown.
4. Use **Refresh**, or allow the page to refresh every 15 seconds.

The dashboard cards show the current API/MongoDB/Redis state, uptime, traffic, `5xx` error rate, latency, Redis hit ratio, memory, and Node.js version. The charts show genuine activity collected since the backend process started.

For lower-level checks, these backend endpoints are also available locally:

| Endpoint | Use it when you want to know |
| --- | --- |
| `GET /health` | Whether the Node/Express process can respond |
| `GET /ready` | Whether MongoDB is available and whether Redis is up or degraded |
| `GET /metrics` | The raw Prometheus metrics for future monitoring tooling |
| `GET /api/admin/observability/summary` | The safe JSON data used by the admin page; requires admin authentication |

## Practical benefits

| Situation | What the feature shows | Why it helps |
| --- | --- | --- |
| A page appears slow | Average API latency and recent latency graph | Distinguishes a slow API from a frontend-only issue |
| Products still load but Redis fails | Overall `Degraded` state and Redis down/cache error signals | Confirms MongoDB fallback is preserving core product reads |
| Users report a server failure | `5xx` count/rate plus request IDs in server logs | Lets an engineer correlate a report with a safe log entry |
| Backend memory grows | Current process RSS memory | Provides an early signal to investigate process behavior |
| Cache effectiveness is uncertain | Hits, misses, and hit ratio | Shows whether Redis caching is actually helping product reads |

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

For example, after a backend restart, request/cache totals and dashboard charts start again from zero. That is expected. Persistent historical trends, alerts, and accurate P95 latency belong to the later Prometheus/Grafana phase.

The dashboard does not expose raw logs, Prometheus text, environment variables, credentials, or payment/authentication data. P95 latency is not shown: it should be calculated later in Prometheus/Grafana with `histogram_quantile`.

## Planned: later phases

1. Grafana Cloud dashboards, persistent storage, and production scraping.
2. Sentry error tracking.
3. Alerting and runbooks.
4. OpenTelemetry only if cross-service tracing becomes necessary.

Never log passwords, JWTs, cookies, authorization headers, MongoDB/Redis credentials, Razorpay secrets, or sensitive payment data.
