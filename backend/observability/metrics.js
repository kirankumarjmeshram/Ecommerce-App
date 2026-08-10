import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });
const MAX_HISTORY_BUCKETS = 60;
const rollingHistory = [];

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

const getCurrentBucket = () => {
  const startedAt = Math.floor(Date.now() / 60000) * 60000;
  let bucket = rollingHistory.at(-1);

  if (!bucket || bucket.timestamp !== startedAt) {
    bucket = {
      timestamp: startedAt,
      requests: 0,
      errors: 0,
      latencyTotalMs: 0,
      latencyCount: 0,
      redisHits: 0,
      redisMisses: 0,
      redisErrors: 0,
    };
    rollingHistory.push(bucket);
    if (rollingHistory.length > MAX_HISTORY_BUCKETS) rollingHistory.shift();
  }

  return bucket;
};

const recordHttpMetrics = (req, res, durationSeconds) => {
  const labels = { method: req.method, route: getRouteLabel(req), status_code: String(res.statusCode) };
  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, durationSeconds);
  const bucket = getCurrentBucket();
  bucket.requests += 1;
  bucket.latencyTotalMs += durationSeconds * 1000;
  bucket.latencyCount += 1;

  if (res.statusCode >= 500) httpErrorsTotal.inc(labels);
  if (res.statusCode >= 500) bucket.errors += 1;
};

const recordRedisCacheHit = (cache) => {
  redisCacheHitsTotal.inc({ cache });
  getCurrentBucket().redisHits += 1;
};
const recordRedisCacheMiss = (cache) => {
  redisCacheMissesTotal.inc({ cache });
  getCurrentBucket().redisMisses += 1;
};
const recordRedisCacheError = (cache) => {
  redisCacheErrorsTotal.inc({ cache });
  getCurrentBucket().redisErrors += 1;
};

const getMetricTotal = async (metric) => {
  const metricData = await metric.get();
  return metricData.values.reduce((total, sample) => total + sample.value, 0);
};

const getHistogramTotals = async () => {
  const metricData = await httpRequestDurationSeconds.get();
  return metricData.values.reduce((totals, sample) => {
    if (sample.metricName === 'http_request_duration_seconds_sum') totals.sumSeconds += sample.value;
    if (sample.metricName === 'http_request_duration_seconds_count') totals.count += sample.value;
    return totals;
  }, { sumSeconds: 0, count: 0 });
};

const getObservabilitySnapshot = async () => {
  const [requests, errors, hits, misses, cacheErrors, latency] = await Promise.all([
    getMetricTotal(httpRequestsTotal),
    getMetricTotal(httpErrorsTotal),
    getMetricTotal(redisCacheHitsTotal),
    getMetricTotal(redisCacheMissesTotal),
    getMetricTotal(redisCacheErrorsTotal),
    getHistogramTotals(),
  ]);

  const cacheReads = hits + misses;
  return {
    http: {
      requests,
      errors,
      errorRate: requests ? Number(((errors / requests) * 100).toFixed(2)) : 0,
      averageLatencyMs: latency.count ? Number(((latency.sumSeconds / latency.count) * 1000).toFixed(2)) : 0,
    },
    cache: {
      hits,
      misses,
      errors: cacheErrors,
      hitRatio: cacheReads ? Number(((hits / cacheReads) * 100).toFixed(2)) : 0,
    },
    history: rollingHistory.map((bucket) => ({
      timestamp: new Date(bucket.timestamp).toISOString(),
      requests: bucket.requests,
      errors: bucket.errors,
      averageLatencyMs: bucket.latencyCount
        ? Number((bucket.latencyTotalMs / bucket.latencyCount).toFixed(2))
        : 0,
      redisHits: bucket.redisHits,
      redisMisses: bucket.redisMisses,
      redisErrors: bucket.redisErrors,
    })),
  };
};

export {
  getObservabilitySnapshot,
  recordHttpMetrics,
  recordRedisCacheError,
  recordRedisCacheHit,
  recordRedisCacheMiss,
  register,
};
