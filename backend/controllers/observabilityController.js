import asyncHandler from '../middleware/asyncHandler.js';
import { isMongoReady } from '../config/db.js';
import { isRedisReady } from '../config/redis.js';
import { getObservabilitySnapshot } from '../observability/metrics.js';

const getObservabilitySummary = asyncHandler(async (req, res) => {
  const mongodb = isMongoReady() ? 'up' : 'down';
  const redis = isRedisReady() ? 'up' : 'down';
  const status = mongodb === 'down' ? 'down' : redis === 'down' ? 'degraded' : 'healthy';
  const metrics = await getObservabilitySnapshot();

  res.json({
    status,
    uptimeSeconds: Math.floor(process.uptime()),
    services: { api: 'up', mongodb, redis },
    ...metrics,
    runtime: {
      memoryUsageMb: Number((process.memoryUsage().rss / 1024 / 1024).toFixed(2)),
      nodeVersion: process.version,
    },
  });
});

export { getObservabilitySummary };
