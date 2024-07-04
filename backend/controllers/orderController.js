import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";

// @desc Create new order
// @route POST / api / orders
// @acces Private
const addOrderItems = asyncHandler(async (req, res) =>{
    res.send('add order item');
});

// @desc Get logged in user orders
// @route GET /api /orders/myorders
// @acces Private
const getMyOrders = asyncHandler(async (req, res) =>{
    res.send('get My Orders');
});

// @desc Get order by ID
// @route GET/ api / orders/:id
// @acces Private // admin
const getOrderById = asyncHandler(async (req, res) =>{
    res.send('get order by id');
});

// @desc Update order to paid
// @route GET / api / orders/:id/pay
// @acces Private
const updateOrderToPaid = asyncHandler(async (req, res) =>{
    res.send('update order to paid');
});

// @desc Update order to delivered
// @route GET / api / orders/:id/delever
// @acces Private/Admin
const updateOrderToDelevered = asyncHandler(async (req, res) =>{
    res.send('update order to delever');
});

// @desc Get all orders
// @route GET / api / orders
// @acces Private/Admin
const getOrders = asyncHandler(async (req, res) =>{
    res.send('get all orders');
});

export {
    addOrderItems,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelevered,
    getOrders 
}