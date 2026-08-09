import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/razorpay/order/:orderId', protect, createRazorpayOrder);
router.post('/razorpay/verify/:orderId', protect, verifyRazorpayPayment);

export default router;
