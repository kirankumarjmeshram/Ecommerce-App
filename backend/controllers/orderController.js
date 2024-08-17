import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";

// @desc Create new order
// @route POST / api / orders
// @acces Private
const addOrderItems = asyncHandler(async (req, res) => {
  // res.send('add order item');

  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  if (orderItems && orderItems.length === 0) {
    res.send(400);
    throw new Error("No order Items");
  } else {
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x._id,
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });
    const createOrder = await order.save();
    res.status(201).json(createOrder);
    // console.log("createOrder", createOrder)
  }
});

// @desc Get logged in user orders
// @route GET /api /orders/myorders
// @acces Private
const getMyOrders = asyncHandler(async (req, res) => {
  // res.send('get My Orders');
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});

// @desc Get order by ID
// @route GET/ api / orders/:id
// @acces Private 
const getOrderById = asyncHandler(async (req, res) => {
  // res.send('get order by id');
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc Update order to paid
// @route PUT / api / orders/:id/pay
// @acces Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  // res.send("update order to paid");
  const order = await Order.findById(req.params.id);

  if(order){
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
      };
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  }else {
    res.status(404);
    throw new Error("Order not found");
  }

});

// @desc Update order to delivered
// @route PUT / api / orders/:id/delever
// @acces Private/Admin
const updateOrderToDelevered = asyncHandler(async (req, res) => {
  // res.send("update order to delever");
  const order = await Order.findById(req.params.id);

  if(order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
  }else{
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc Get all orders
// @route GET / api / orders
// @acces Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  // res.send("get all orders");  
  const orders = await Order.find({}).populate('user','id name');
  // .populate('user', 'id, name');
  res.status(200).json(orders);
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelevered,
  getOrders,
};
