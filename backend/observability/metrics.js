import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total', help: 'Total completed HTTP requests',
  labelNames: ['method', 'route', 'status_code'], registers: [register],
});
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds', help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], registers: [register],
});
const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total', help: 'Total completed HTTP responses with status code 500 or greater',
  labelNames: ['method', 'route', 'status_code'], registers: [register],
});
const redisCacheHitsTotal = new client.Counter({
  name: 'redis_cache_hits_total', help: 'Total Redis cache hits', labelNames: ['cache'], registers: [register],
});
const redisCacheMissesTotal = new client.Counter({
  name: 'redis_cache_misses_total', help: 'Total Redis cache misses', labelNames: ['cache'], registers: [register],
});
const redisCacheErrorsTotal = new client.Counter({
  name: 'redis_cache_errors_total', help: 'Total Redis cache operation errors', labelNames: ['cache'], registers: [register],
});

const getRouteLabel = (req) => (req.route?.path ? `${req.baseUrl || ''}${req.route.path}` : 'unmatched');

const recordHttpMetrics = (req, res, durationSeconds) => {
  const labels = { method: req.method, route: getRouteLabel(req), status_code: String(res.statusCode) };
  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, durationSeconds);
  if (res.statusCode >= 500) httpErrorsTotal.inc(labels);
};

const recordRedisCacheHit = (cache) => redisCacheHitsTotal.inc({ cache });
const recordRedisCacheMiss = (cache) => redisCacheMissesTotal.inc({ cache });
const recordRedisCacheError = (cache) => redisCacheErrorsTotal.inc({ cache });

export { recordHttpMetrics, recordRedisCacheError, recordRedisCacheHit, recordRedisCacheMiss, register };
