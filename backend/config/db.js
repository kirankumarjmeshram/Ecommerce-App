import mongoose from 'mongoose';

const connectDB = async () => {
  const db = "mongodb://127.0.0.1:27017/ecomdb";
  try {
    // const conn = await mongoose.connect(process.env.MONGO_URI);
    const conn = await mongoose.connect(db);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
