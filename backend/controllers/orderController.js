import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const assertOrderId = (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid order ID');
  }
};

const canAccessOrder = (order, user) => user.isAdmin || order.user.toString() === user._id.toString();

const getValidatedShippingAddress = (shippingAddress, res) => {
  const fields = ['address', 'city', 'postalCode', 'country'];
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    res.status(400);
    throw new Error('A complete shipping address is required');
  }

  const normalizedAddress = {};
  for (const field of fields) {
    if (typeof shippingAddress[field] !== 'string' || !shippingAddress[field].trim()) {
      res.status(400);
      throw new Error(`Shipping address ${field} is required`);
    }
    normalizedAddress[field] = shippingAddress[field].trim();
  }
  return normalizedAddress;
};

const createAuthoritativeOrderItems = async (requestedItems, res) => {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const quantities = new Map();
  for (const item of requestedItems) {
    const productId = item?.product || item?._id;
    const qty = Number(item?.qty);
    if (!mongoose.isValidObjectId(productId) || !Number.isInteger(qty) || qty < 1) {
      res.status(400);
      throw new Error('Each order item must include a valid product and positive quantity');
    }
    quantities.set(productId.toString(), (quantities.get(productId.toString()) || 0) + qty);
  }

  const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));
  const orderItems = [];

  for (const [productId, qty] of quantities) {
    const product = productsById.get(productId);
    if (!product) {
      res.status(404);
      throw new Error('One or more products no longer exist');
    }
    if (product.countInStock < qty) {
      res.status(400);
      throw new Error(`${product.name} does not have enough stock`);
    }
    orderItems.push({ name: product.name, qty, image: product.image, price: product.price, product: product._id });
  }
  return orderItems;
};

// @desc Create a new order using MongoDB product records as the price source
// @route POST /api/orders
// @access Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems: requestedItems, shippingAddress, paymentMethod } = req.body;
  if (paymentMethod !== 'Razorpay') {
    res.status(400);
    throw new Error('A supported payment method is required');
  }

  const orderItems = await createAuthoritativeOrderItems(requestedItems, res);
  const itemsPrice = roundCurrency(orderItems.reduce((sum, item) => sum + item.price * item.qty, 0));
  const shippingPrice = itemsPrice > 1000 ? 0 : 100;
  const taxPrice = roundCurrency(itemsPrice * 0.12);
  const totalPrice = roundCurrency(itemsPrice + shippingPrice + taxPrice);

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress: getValidatedShippingAddress(shippingAddress, res),
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });
  res.status(201).json(order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  assertOrderId(req.params.id, res);
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!canAccessOrder(order, req.user)) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.status(200).json(order);
});

const updateOrderToDelevered = asyncHandler(async (req, res) => {
  assertOrderId(req.params.id, res);
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!order.isDelivered) {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  res.json(await order.save());
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  res.status(200).json(orders);
});

export { addOrderItems, getMyOrders, getOrderById, updateOrderToDelevered, getOrders };
