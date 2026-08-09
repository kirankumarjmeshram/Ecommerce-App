import crypto from 'crypto';
import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import getRazorpay from '../config/razorpay.js';

const assertRazorpayConfig = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured');
  }
};

const canAccessOrder = (order, user) =>
  order.user.toString() === user._id.toString() || user.isAdmin;

const getSafeRazorpayError = (error) => ({
  message: error.message,
  statusCode: error.statusCode,
  code: error.error?.code,
  description: error.error?.description,
  reason: error.error?.reason,
  source: error.error?.source,
  step: error.error?.step,
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
  assertRazorpayConfig();

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!canAccessOrder(order, req.user)) {
    res.status(403);
    throw new Error('Not authorized to pay for this order');
  }
  if (order.isPaid) {
    res.status(400);
    throw new Error('Order has already been paid');
  }

  const amount = Math.round(Number(order.totalPrice) * 100);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    res.status(400);
    throw new Error('Order has an invalid payable amount');
  }

  let razorpayOrderId = order.paymentResult?.razorpayOrderId;
  if (!razorpayOrderId) {
    let razorpayOrder;
    try {
      razorpayOrder = await getRazorpay().orders.create({
        amount,
        currency: 'INR',
        receipt: `ecom_${order._id}`,
        notes: { ecommerceOrderId: order._id.toString() },
      });
    } catch (error) {
      const safeError = getSafeRazorpayError(error);
      if (process.env.NODE_ENV === 'development') {
        console.error('Razorpay order creation failed:', safeError);
      }

      return res.status(500).json({
        message: 'Unable to create Razorpay order',
        ...(process.env.NODE_ENV === 'development' && safeError.description
          ? { error: safeError.description }
          : {}),
      });
    }

    razorpayOrderId = razorpayOrder.id;
    order.paymentResult = {
      provider: 'razorpay',
      razorpayOrderId,
      status: 'created',
    };
    await order.save();
  }

  res.status(201).json({
    key: process.env.RAZORPAY_KEY_ID,
    razorpayOrderId,
    amount,
    currency: 'INR',
  });
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  assertRazorpayConfig();

  const {
    razorpay_payment_id: razorpayPaymentId,
    razorpay_order_id: razorpayOrderId,
    razorpay_signature: razorpaySignature,
  } = req.body;
  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    res.status(400);
    throw new Error('Missing Razorpay payment verification details');
  }

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!canAccessOrder(order, req.user)) {
    res.status(403);
    throw new Error('Not authorized to verify this payment');
  }
  if (order.paymentResult?.razorpayOrderId !== razorpayOrderId) {
    res.status(400);
    throw new Error('Razorpay order does not match this ecommerce order');
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${order.paymentResult.razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  const signatureIsValid =
    expectedSignature.length === razorpaySignature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature));

  if (!signatureIsValid) {
    res.status(400);
    throw new Error('Invalid Razorpay payment signature');
  }
  if (order.isPaid) {
    if (order.paymentResult?.razorpayPaymentId === razorpayPaymentId) {
      return res.json(order);
    }
    res.status(400);
    throw new Error('Order has already been paid');
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    provider: 'razorpay',
    razorpayOrderId,
    razorpayPaymentId,
    status: 'verified',
    verifiedAt: new Date(),
  };

  res.json(await order.save());
});

export { createRazorpayOrder, verifyRazorpayPayment };
