import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminObservabilityRoutes from './routes/adminObservabilityRoutes.js';
import { isRedisReady } from './config/redis.js';
import { isMongoReady } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { httpLogger } from './observability/logger.js';
import { recordHttpMetrics, register } from './observability/metrics.js';

const app = express();

app.use(httpLogger);
app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    recordHttpMetrics(req, res, Number(process.hrtime.bigint() - startedAt) / 1e9);
  });
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));

app.get('/', (req, res) => res.send('Api is running'));
app.get('/health', (req, res) => res.status(200).json({
  status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString(),
}));
app.get('/ready', (req, res) => {
  const mongodb = isMongoReady() ? 'up' : 'down';
  const redis = isRedisReady() ? 'up' : 'down';
  if (mongodb === 'down') return res.status(503).json({ status: 'not_ready', services: { mongodb, redis } });
  return res.status(200).json({ status: redis === 'up' ? 'ready' : 'degraded', services: { mongodb, redis } });
});
app.get('/metrics', async (req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error);
  }
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/observability', adminObservabilityRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
