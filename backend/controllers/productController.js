import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products)
})

// @desc    Fetch all product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product)
    } else {
        res.status(404)
        throw new Error('Product not found')
    }
})

// @desc    create  products
// @route   CREATE /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        // name: req.body.name,
        // price: req.body.price,
        // user: req.user.id,
        // image: req.body.image,
        // brand: req.body.brand,
        // category: req.body.category,
        // countInStock:0,
        // description: req.body.description,
        name: "req.body.name",
        price: "req.body.price",
        user: req.user.id,
        image: "req.body.image",
        brand: "req.body.brand",
        category: "req.body.category",
        countInStock:0,
        numReviews:0,
        description: "req.body.description",
    })
    console.log("product")
    const createProduct = await product.save();
    
    res.status(201).json(createProduct)
})

export { getProducts, getProductById, createProduct }