import { logger } from '../observability/logger.js';

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = 'Resource not found';
    statusCode = 404;
  }

  if (statusCode >= 500) {
    logger.error({
      err,
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode,
    }, 'Unhandled request error');
  }

  const response = { message };
  if (process.env.NODE_ENV !== 'production') response.stack = err.stack;
  res.status(statusCode).json(response);
};

export { notFound, errorHandler };
