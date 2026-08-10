import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();
// console.log('Loaded environment variables:', process.env.PORT);
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import adminObservabilityRoutes from './routes/adminObservabilityRoutes.js';
import { connectRedis, disconnectRedis, isRedisReady } from './config/redis.js';
import { disconnectDB, isMongoReady } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { httpLogger, logger } from './observability/logger.js';
import { recordHttpMetrics, register } from './observability/metrics.js';
const port = process.env.PORT || 5001;

const app = express();

app.use(httpLogger);
app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
        const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
        recordHttpMetrics(req, res, durationSeconds);
    });
    next();
});

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Cookie parser middleware
app.use(cookieParser())
// app.use(cors());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

app.get('/', (req, res) => {
    res.send('Api is running');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.get('/ready', (req, res) => {
    const mongodb = isMongoReady() ? 'up' : 'down';
    const redis = isRedisReady() ? 'up' : 'down';

    if (mongodb === 'down') {
        return res.status(503).json({ status: 'not_ready', services: { mongodb, redis } });
    }

    return res.status(200).json({
        status: redis === 'up' ? 'ready' : 'degraded',
        services: { mongodb, redis },
    });
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
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin/observability', adminObservabilityRoutes)

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    logger.info('Application starting');
    await connectDB();
    connectRedis();

    const server = app.listen(port, () => {
        logger.info({ port }, 'Server listening');
    });

    let isShuttingDown = false;
    const shutdown = async (signal) => {
        if (isShuttingDown) return;
        isShuttingDown = true;
        logger.info({ signal }, 'Shutdown requested');

        server.close(async (error) => {
            if (error) {
                logger.error({ err: error }, 'HTTP server shutdown failed');
                process.exitCode = 1;
            }

            try {
                await Promise.all([disconnectDB(), disconnectRedis()]);
                logger.info('Shutdown complete');
            } catch (shutdownError) {
                logger.error({ err: shutdownError }, 'Dependency shutdown failed');
                process.exitCode = 1;
            }
        });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();
