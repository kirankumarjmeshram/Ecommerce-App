import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
const userSchema = mongoose.Schema({
    name:{type:String, required: true, trim: true},
    email:{type:String, required:true, unique:true, trim: true, lowercase: true},
    password:{type:String, required:true},
    isAdmin:{
        type:Boolean,
        required:true,
        default:false
    }
},{
    timestamps:true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// Encrypt password using bcryp
//here .pre allow us to do somthing before saving to database
// and if we use .post then it do something after saving the db
userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

const User = mongoose.model('User',userSchema);
export default User
