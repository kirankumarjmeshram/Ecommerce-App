import mongoose from 'mongoose';
import { logger } from '../observability/logger.js';

const connectDB = async () => {
  const db = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecomdb';

  if (!db) {
    throw new Error('MONGO_URI is not defined');
  }

  try {
    const conn = await mongoose.connect(db);
    logger.info({ databaseHost: conn.connection.host }, 'MongoDB connected');
    return conn;
  } catch (error) {
    logger.fatal({ err: error }, 'MongoDB connection failed');
    process.exit(1);
  }
};

const isMongoReady = () => mongoose.connection.readyState === 1;

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
};

export { disconnectDB, isMongoReady };
export default connectDB;
