import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema=new Schema({
   username:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    index:true   //searching aasan banata hai
   },
   email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trime:true,
   },
   fullname:{
    type:String,
    required:true,
    trime:true,
    index:true
   },
   avatar:{
    type:String, //cloudinary url
    required:true,
   },
   coverImage:{
    type:String //cloudinary url
   },
   watchHistory:[{
       type:Schema.Types.ObjectId,
       ref:"Video"
   }],
   password:{
    type:String,
    required:[true,'password is required']
   },
   refreshToken:{
     type:String
   }

},{
    timestamps:true
});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
})
//userSchema.methods use to add multiple function 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.method.generateAccessToken=function(){
       jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,
       },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.method.generateRefreshToken=function(){
    jwt.sign({
     _id:this._id,
     email:this.email,
     username:this.username,
     fullname:this.fullname,
    },
 process.env.ACCESS_TOKEN_SECRET,{
     expiresIn: process.env.ACCESS_TOKEN_EXPIRY
 })
}

userSchema.method.gnerateAccessToken=function(){}

export const User=mongoose.model("User",userSchema);
