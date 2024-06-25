import asyncHandler from "../middleware/asyncHandler.js";
import User from '../models/userModel.js';

// @desc Auth user & get token
// @route POST/api/users/login
// @access Public

const authUser = asyncHandler(async (req, res)=>{
    res.send('auth user')
})

// @desc Register user
// @route POST/api/users
// @access Public

const registerUser = asyncHandler(async (req, res)=>{
    res.send('register user')
})

// @desc user/ clear cookies
// @route POST/api/users/logout
// @access Private

const logoutUser = asyncHandler(async (req, res)=>{
    res.send('logout user')
})

// @desc Get User Profile
// @route GET/api/users/profile
// @access Public

const getUserProfile = asyncHandler(async (req, res)=>{
    res.send('get user profile')
})

// @desc Get Update Profile
// @route PUT/api/users/profile // here we are not getting id bcz we are getting token as it is self profile ie user profile
// @access Private

const updateUserProfile = asyncHandler(async (req, res)=>{
    res.send('update user profile')
})


// @desc Get Users
// @route GET/api/users
// @access Private/Admin

const getUsers = asyncHandler(async (req, res)=>{
    res.send('get users')
})

// @desc Delete User
// @route DELETE/api/users/:id
// @access Private/Admin

const deleteUser = asyncHandler(async (req, res)=>{
    res.send('delete users')
})

// @desc Get User by ID
// @route GET/api/users/:id
// @access Private/Admin

const getUserById = asyncHandler(async (req, res)=>{
    res.send('get users by ID')
})

// @desc Update User
// @route PUT/api/users/:id
// @access Private/Admin

const updateUser = asyncHandler(async (req, res)=>{
    res.send('update user')
})

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser
};

