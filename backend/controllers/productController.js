import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import {
  createProductCacheKey,
  createProductListCacheKey,
  invalidateProductCache,
  invalidateProductListCaches,
  readCache,
  writeCache,
} from '../utils/productCache.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const cacheKey = createProductListCacheKey(req.query);
  const cachedProducts = await readCache(cacheKey, { requestId: req.id });
  if (cachedProducts) {
    res.set('X-Cache', 'HIT');
    return res.json(cachedProducts);
  }

  const products = await Product.find({});
  res.set('X-Cache', 'MISS');
  await writeCache(cacheKey, products, { requestId: req.id });
  res.json(products);
});

// @desc    Fetch all product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const cacheKey = createProductCacheKey(req.params.id);
  const cachedProduct = await readCache(cacheKey, { requestId: req.id });
  if (cachedProduct) {
    res.set('X-Cache', 'HIT');
    return res.json(cachedProduct);
  }

  const product = await Product.findById(req.params.id);
  if (product) {
    res.set('X-Cache', 'MISS');
    await writeCache(cacheKey, product, { requestId: req.id });
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    create  products
// @route   CREATE /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    user: req.user.id,
    image: req.body.image,
    brand: req.body.brand,
    category: req.body.category,
    countInStock: 0,
    description: req.body.description,
    // name: "name",
    // price: 100,
    // user: req.user.id,
    // image: "image",
    // brand: "brand",
    // category: "category",
    // countInStock: 0,
    // numReviews: 0,
    // description: "description",
  });
  // console.log("product");
  const createProduct = await product.save();

  await invalidateProductListCaches({ requestId: req.id });

  res.status(201).json(createProduct);
});

// @desc    update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  // const { name, price, description, image, brand, category, countInStock } =
  //   req.body;
  const { id } = req.params;
  const product = await Product.findById(id);
  console.log("Hello")
  console.log(id)
  
  if (product) {
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.image = req.body.image || product.image;
    product.brand = req.body.brand || product.brand;
    product.category = req.body.category || product.category;
    product.countInStock = req.body.countInStock || product.countInStock;
    product.description = req.body.description || product.description;
    console.log("Update product")
    const updatedProduct = await product.save();
    await invalidateProductCache(product._id, { requestId: req.id });
    await invalidateProductListCaches({ requestId: req.id });
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
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

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
