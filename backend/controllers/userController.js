import asyncHandler from "../middleware/asyncHandler.js";
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import generateToken from "../utils/generateToken.js";
dotenv.config();


// @desc Auth user & get token
// @route POST/api/users/login
// @access Public

const authUser = asyncHandler(async (req, res) => {
    // console.log(req.body)
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // console.log(process.env.JWT_SECRET);
    
    //await 
    if (user && (await user.matchPassword(password))) {
        generateToken(res ,user._id)

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        });
    } else {
        res.status(401);
        throw new Error('Invalid Email or Password')
    }
    // res.send('auth user')

})

// @desc Register user
// @route POST/api/users
// @access Public

const registerUser = asyncHandler(async (req, res) => {
    // res.send('register user')
    const {name, email, password } = req.body;
    const userExist = await User.findOne({email});

    if(userExist) {
        res.status(400);
        throw new Error("User already Exist")
    }

    const user = await User.create({
        name,
        email,
        password
    });

    if(user) {
        generateToken(res ,user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        });
    }else{
        res.status(400);
        throw new Error('Invalid User data');
    }
})

// @desc user/ clear cookies
// @route POST/api/users/logout
// @access Private

const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt','',{
        httpOnly: true,
        expires: new Date(0)
    })

    res.status(200).json({message:"Logged out successfully"})
    
})

// @desc Get User Profile
// @route GET/api/users/profile
// @access Public

const getUserProfile = asyncHandler(async (req, res) => {
    // res.send('get user profile')
    const user = await User.findById(req.user._id);

    if(user){
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        });
    }else{
        res.status(404);
        throw new Error('User not found')
    }
})

// @desc Get Update Profile
// @route PUT/api/users/profile // here we are not getting id bcz we are getting token as it is self profile ie user profile
// @access Private

const updateUserProfile = asyncHandler(async (req, res) => {
    // res.send('update user profile')
    const user = await User.findById(req.user._id);

    if(user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if(req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        })
    } else {
        res.status(404);
        throw new Error('User not found')
    }
})


// @desc Get Users
// @route GET/api/users
// @access Private/Admin

const getUsers = asyncHandler(async (req, res) => {
    res.send('get users')
})

// @desc Delete User
// @route DELETE/api/users/:id
// @access Private/Admin

const deleteUser = asyncHandler(async (req, res) => {
    res.send('delete users')
})

// @desc Get User by ID
// @route GET/api/users/:id
// @access Private/Admin

const getUserById = asyncHandler(async (req, res) => {
    res.send('get users by ID')
})

// @desc Update User
// @route PUT/api/users/:id
// @access Private/Admin

const updateUser = asyncHandler(async (req, res) => {
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

