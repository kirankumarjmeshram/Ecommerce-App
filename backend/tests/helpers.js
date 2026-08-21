import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.RAZORPAY_KEY_ID = 'rzp_test_local';
process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-secret';

const { default: app } = await import('../app.js');
const { default: User } = await import('../models/userModel.js');
const { default: Product } = await import('../models/productModel.js');
const { default: Order } = await import('../models/orderModel.js');

let mongo;
const startDatabase = async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
};
const stopDatabase = async () => {
  await mongoose.disconnect();
  await mongo?.stop();
};
const resetDatabase = async () => {
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);
};
const register = async (agent, overrides = {}) => {
  const data = { name: 'Customer', email: `user${Date.now()}@test.local`, password: 'Password123!', ...overrides };
  const response = await agent.post('/api/users').send(data).expect(201);
  return { response, user: response.body, data };
};
const createProduct = async (overrides = {}) => Product.create({
  user: overrides.userId || new mongoose.Types.ObjectId(), name: 'Test product', image: '/test.jpg', brand: 'Test',
  category: 'Test', description: 'Test product description', price: 1000, countInStock: 4, ...overrides,
});

export { app, request, User, Product, Order, startDatabase, stopDatabase, resetDatabase, register, createProduct };
