import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';

const isValidRequestId = (value) =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= 128 &&
  /^[A-Za-z0-9._-]+$/.test(value);

const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  base: { service: 'ecommerce-api', environment: process.env.NODE_ENV || 'development' },
  redact: {
    paths: [
      'req.headers.authorization', 'req.headers.cookie', 'headers.authorization', 'headers.cookie',
      'authorization', 'cookie', 'password', '*.password', 'razorpay_signature',
    ],
    censor: '[REDACTED]',
  },
});

const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incomingRequestId = req.headers['x-request-id'];
    const requestId = isValidRequestId(incomingRequestId) ? incomingRequestId : randomUUID();
    res.setHeader('X-Request-Id', requestId);
    return requestId;
  },
  serializers: {
    req: (req) => ({ method: req.method, path: req.originalUrl || req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  customSuccessObject: (req, res, value) => ({
    requestId: req.id,
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode: res.statusCode,
    durationMs: Math.round(value.responseTime || 0),
    ...(req.user?._id ? { userId: req.user._id.toString() } : {}),
  }),
});

export { httpLogger, logger };
