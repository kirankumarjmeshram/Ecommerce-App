import express from 'express';
const router = express.Router();

import {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser
} from '../controllers/userController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
    .post(registerUser)
    .get(protect,admin, getUsers);
router.post('/logout', logoutUser);
router.post('/auth', authUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .post(protect, updateUserProfile);//in /profile if get request then get user profile else if it post request then update user profile
router.route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin,updateUser);

export default router;