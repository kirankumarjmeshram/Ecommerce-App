import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import { parseProductQuery } from '../utils/productQuery.js';
import {
  createProductCacheKey,
  createProductListCacheKey,
  invalidateProductCache,
  invalidateProductListCaches,
  readCache,
  writeCache,
} from '../utils/productCache.js';

const PRODUCT_TEXT_FIELDS = ['name', 'image', 'brand', 'category', 'description'];

const assertProductId = (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid product ID');
  }
};

const getValidatedProductFields = (body, res, { partial = false } = {}) => {
  const product = {};
  for (const field of PRODUCT_TEXT_FIELDS) {
    if (body[field] === undefined) {
      if (!partial) {
        res.status(400);
        throw new Error(`${field} is required`);
      }
      continue;
    }
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      res.status(400);
      throw new Error(`${field} must be a non-empty string`);
    }
    product[field] = body[field].trim();
  }

  for (const field of ['price', 'countInStock']) {
    if (body[field] === undefined) {
      if (!partial) {
        res.status(400);
        throw new Error(`${field} is required`);
      }
      continue;
    }
    const value = Number(body[field]);
    const valid = field === 'price' ? Number.isFinite(value) && value >= 0 : Number.isInteger(value) && value >= 0;
    if (!valid) {
      res.status(400);
      throw new Error(field === 'price' ? 'price must be a non-negative number' : 'countInStock must be a non-negative integer');
    }
    product[field] = value;
  }
  return product;
};

const getProducts = asyncHandler(async (req, res) => {
  let parsed;
  try { parsed = parseProductQuery(req.query); } catch (error) { res.status(400); throw error; }
  const { normalized, filter, sort } = parsed;
  const cacheKey = createProductListCacheKey(normalized);
  const cachedProducts = await readCache(cacheKey, { requestId: req.id });
  if (cachedProducts) {
    res.set('X-Cache', 'HIT');
    return res.json(cachedProducts);
  }

  const [products, totalProducts] = await Promise.all([
    Product.find(filter).sort(sort).skip((normalized.page - 1) * normalized.limit).limit(normalized.limit).lean(),
    Product.countDocuments(filter),
  ]);
  const result = { products, page: normalized.page, pages: Math.ceil(totalProducts / normalized.limit), totalProducts };
  res.set('X-Cache', 'MISS');
  await writeCache(cacheKey, result, { requestId: req.id });
  res.json(result);
});

const getProductCategories = asyncHandler(async (req, res) => {
  const cacheKey = createProductListCacheKey({ resource: 'categories' });
  const cached = await readCache(cacheKey, { requestId: req.id });
  if (cached) { res.set('X-Cache', 'HIT'); return res.json(cached); }
  const categories = (await Product.distinct('category')).filter((value) => typeof value === 'string' && value.trim()).sort((a, b) => a.localeCompare(b));
  const result = { categories };
  await writeCache(cacheKey, result, { requestId: req.id });
  res.set('X-Cache', 'MISS');
  res.json(result);
});

const getProductById = asyncHandler(async (req, res) => {
  assertProductId(req.params.id, res);
  const cacheKey = createProductCacheKey(req.params.id);
  const cachedProduct = await readCache(cacheKey, { requestId: req.id });
  if (cachedProduct) {
    res.set('X-Cache', 'HIT');
    return res.json(cachedProduct);
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.set('X-Cache', 'MISS');
  await writeCache(cacheKey, product, { requestId: req.id });
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const fields = getValidatedProductFields(req.body, res);
  const product = await Product.create({ ...fields, user: req.user._id });
  await invalidateProductListCaches({ requestId: req.id });
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  assertProductId(req.params.id, res);
  const fields = getValidatedProductFields(req.body, res, { partial: true });
  if (Object.keys(fields).length === 0) {
    res.status(400);
    throw new Error('At least one product field is required');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  Object.assign(product, fields);
  const updatedProduct = await product.save();
  await invalidateProductCache(product._id, { requestId: req.id });
  await invalidateProductListCaches({ requestId: req.id });
  res.json(updatedProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  assertProductId(req.params.id, res);
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  await invalidateProductCache(product._id, { requestId: req.id });
  await invalidateProductListCaches({ requestId: req.id });
  res.json({ message: 'Product removed' });
});

export { getProducts, getProductCategories, getProductById, createProduct, updateProduct, deleteProduct };
