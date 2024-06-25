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

router.route('/').get(getUsers);
router.post('/logout',logoutUser);
router.post('/login',logoutUser);
router.route('/user').get(getUserProfile).post(updateUserProfile);//in /profile if get request then get user profile else if it post request then update user profile
router.route('/:id').delete(deleteUser).get(getUserById).put(updateUser);

export default router;