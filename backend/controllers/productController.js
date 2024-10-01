import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Fetch all product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
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

  res.status(201).json(createProduct);
});

// @desc    update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;
  const product = await Product.findById(req.params.id);
  console.log(name, price, description, image, brand, category, countInStock)
  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

export { getProducts, getProductById, createProduct, updateProduct };
