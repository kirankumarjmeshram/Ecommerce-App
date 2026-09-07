import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import { invalidateProductCache, invalidateProductListCaches } from '../utils/productCache.js';

const fail = (res, status, message) => { res.status(status); throw new Error(message); };
const productFor = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) fail(res, 400, 'Invalid product ID');
  const product = await Product.findById(req.params.id);
  if (!product) fail(res, 404, 'Product or review not found.');
  return product;
};
const purchaseState = async (user, product) => {
  const query = { user, 'orderItems.product': product };
  if (await Order.exists({ ...query, isPaid: true, isDelivered: true })) return 'eligible';
  if (await Order.exists({ ...query, isPaid: true })) return 'awaiting_delivery';
  if (await Order.exists(query)) return 'awaiting_payment';
  return 'not_purchased';
};
const fields = (body, res) => {
  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) fail(res, 400, 'Please select a rating between 1 and 5.');
  const result = { rating: body.rating };
  for (const [key, max] of [['title', 120], ['comment', 2000]]) {
    if (typeof body[key] !== 'string' || !body[key].trim() || body[key].trim().length > max || /[<>]/.test(body[key])) fail(res, 400, `${key} must be plain text between 1 and ${max} characters.`);
    result[key] = body[key].trim();
  }
  return result;
};
// A single document update changes reviews and recomputes aggregates atomically.
const aggregateStage = { $set: { numReviews: { $size: '$reviews' }, rating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] } } };
const invalidate = async (req) => { await invalidateProductCache(req.params.id, { requestId: req.id }); await invalidateProductListCaches({ requestId: req.id }); };

export const reviewEligibility = asyncHandler(async (req, res) => {
  const product = await productFor(req, res);
  const review = product.reviews.find((item) => item.user.equals(req.user._id));
  res.json({ state: review ? 'reviewed' : await purchaseState(req.user._id, product._id) });
});
export const createReview = asyncHandler(async (req, res) => {
  const product = await productFor(req, res);
  const values = fields(req.body, res);
  if (await purchaseState(req.user._id, product._id) !== 'eligible') fail(res, 403, 'Only verified buyers with paid and delivered orders can review this product.');
  const review = { ...values, _id: new mongoose.Types.ObjectId(), user: req.user._id, name: req.user.name, verifiedPurchase: true, createdAt: new Date(), updatedAt: new Date() };
  const updated = await Product.findOneAndUpdate({ _id: product._id, 'reviews.user': { $ne: req.user._id } }, [
    { $set: { reviews: { $concatArrays: [{ $ifNull: ['$reviews', []] }, { $literal: [review] }] } } }, aggregateStage,
  ], { new: true });
  if (!updated) fail(res, 409, 'You have already reviewed this product.');
  await invalidate(req);
  res.status(201).json({ message: 'Review created' });
});
export const updateReview = asyncHandler(async (req, res) => {
  const product = await productFor(req, res);
  const review = product.reviews.id(req.params.reviewId);
  if (!review) fail(res, 404, 'Product or review not found.');
  if (!review.user.equals(req.user._id)) fail(res, 403, 'You can only edit your own review.');
  const values = fields(req.body, res);
  // Legacy unverified entries cannot be edited into verified reviews.
  if (await purchaseState(req.user._id, product._id) !== 'eligible') fail(res, 403, 'Only verified buyers with paid and delivered orders can update a review.');
  const updated = await Product.findOneAndUpdate({ _id: product._id, reviews: { $elemMatch: { _id: review._id, user: req.user._id } } }, [
    { $set: { reviews: { $map: { input: '$reviews', as: 'review', in: { $cond: [{ $eq: ['$$review._id', review._id] }, { $mergeObjects: ['$$review', { $literal: { ...values, updatedAt: new Date() } }] }, '$$review'] } } } } }, aggregateStage,
  ], { new: true });
  if (!updated) fail(res, 409, 'Review changed. Refresh and try again.');
  await invalidate(req); res.json({ message: 'Review updated' });
});
export const deleteReview = asyncHandler(async (req, res) => {
  const product = await productFor(req, res);
  const review = product.reviews.id(req.params.reviewId);
  if (!review) fail(res, 404, 'Product or review not found.');
  if (!req.user.isAdmin && !review.user.equals(req.user._id)) fail(res, 403, 'You can only delete your own review.');
  await Product.findOneAndUpdate({ _id: product._id }, [
    { $set: { reviews: { $filter: { input: '$reviews', as: 'review', cond: { $ne: ['$$review._id', review._id] } } } } }, aggregateStage,
  ]);
  await invalidate(req); res.json({ message: 'Review deleted' });
});
