import asyncHandler from '../middleware/asyncHandler.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import generateToken from '../utils/generateToken.js';
import { getJwtCookieOptions } from '../utils/generateToken.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  status: user.status || 'active',
  createdAt: user.createdAt,
});

const getValidUserId = (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }
  return id;
};

const normalizeEmail = (email, res) => {
  if (typeof email !== 'string') {
    res.status(400);
    throw new Error('A valid email is required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    res.status(400);
    throw new Error('A valid email is required');
  }
  return normalizedEmail;
};

const validateName = (name, res) => {
  if (typeof name !== 'string' || !name.trim()) {
    res.status(400);
    throw new Error('Name is required');
  }
  return name.trim();
};

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: typeof email === 'string' ? email.trim().toLowerCase() : email });

  if (user && (await user.matchPassword(password))) {
    if (user.status === 'suspended') { res.status(403); throw new Error('This account is suspended. Contact the store administrator.'); }
    generateToken(res, user._id);
    res.json(toSafeUser(user));
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedName = validateName(name, res);
  const normalizedEmail = normalizeEmail(email, res);
  const userExist = await User.findOne({ email: normalizedEmail });

  if (userExist) {
    res.status(400);
    throw new Error('Email is already in use');
  }

  if (typeof password !== 'string' || !password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const user = await User.create({ name: normalizedName, email: normalizedEmail, password });
  generateToken(res, user._id);
  res.status(201).json(toSafeUser(user));
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    ...getJwtCookieOptions(),
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json(toSafeUser(user));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.body.name !== undefined) user.name = validateName(req.body.name, res);
  if (req.body.email !== undefined) user.email = normalizeEmail(req.body.email, res);
  if (req.body.password) user.password = req.body.password;

  try {
    const updatedUser = await user.save();
    res.status(200).json(toSafeUser(updatedUser));
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    throw error;
  }
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('_id name email isAdmin status createdAt')
    .sort({ createdAt: -1 });
  const counts = await Order.aggregate([{ $group: { _id: '$user', count: { $sum: 1 } } }]);
  const countsByUser = new Map(counts.map((item) => [String(item._id), item.count]));
  res.json(users.map((user) => ({ ...toSafeUser(user), orderCount: countsByUser.get(String(user._id)) || 0 })));
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = getValidUserId(req.params.id, res);

  if (req.user._id.toString() === userId.toString()) {
    res.status(400);
    throw new Error('Administrators cannot delete their own account');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (await Order.exists({ user: user._id }) || await Product.exists({ 'reviews.user': user._id })) {
    res.status(409);
    throw new Error('This account has order or review history and cannot be permanently deleted. Suspend the account instead.');
  }
  await user.deleteOne();
  res.json({ message: 'User removed' });
});

const getUserById = asyncHandler(async (req, res) => {
  const userId = getValidUserId(req.params.id, res);
  const user = await User.findById(userId).select('_id name email isAdmin status createdAt');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const userId = getValidUserId(req.params.id, res);
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.body.name !== undefined) user.name = validateName(req.body.name, res);

  if (req.body.email !== undefined) {
    const normalizedEmail = normalizeEmail(req.body.email, res);
    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existingUser) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    user.email = normalizedEmail;
  }

  if (req.body.isAdmin !== undefined) {
    if (typeof req.body.isAdmin !== 'boolean') {
      res.status(400);
      throw new Error('isAdmin must be a boolean');
    }
    user.isAdmin = req.body.isAdmin;
  }

  if (req.body.status !== undefined) {
    if (!['active', 'suspended'].includes(req.body.status)) { res.status(400); throw new Error('Invalid account status'); }
    if (req.body.status === 'suspended' && (user.isAdmin || user._id.equals(req.user._id))) { res.status(400); throw new Error('Administrator accounts cannot be suspended.'); }
    user.status = req.body.status;
  }

  try {
    const updatedUser = await user.save();
    res.json(toSafeUser(updatedUser));
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    throw error;
  }
});

export {
  authUser,
  deleteUser,
  getUserById,
  getUserProfile,
  getUsers,
  logoutUser,
  registerUser,
  updateUser,
  updateUserProfile,
};
