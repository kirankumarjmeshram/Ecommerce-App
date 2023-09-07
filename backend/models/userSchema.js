import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
    name:{type:String, require: true},
    email:{type:String, require:true, unique:true},
    password:{type:String, require:true},
    isAdmin:{
        type:Boolean,
        require:true,
        default:false
    }
},{
    timestamps:true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// Encrypt password using bcrypt
userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
})

const User = mongoose.model('User',userSchema);
export default User