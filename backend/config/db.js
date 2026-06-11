import mongoose from 'mongoose';

const connectDB = async () => {
  const db = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecomdb';

  if (!db) {
    throw new Error('MONGO_URI is not defined');
  }

  try {
    const conn = await mongoose.connect(db);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
