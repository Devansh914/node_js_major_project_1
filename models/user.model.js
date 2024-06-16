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
    trim:true,
   },
   fullname:{
    type:String,
    required:true,
    trim:true,
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

userSchema.methods.generateAccessToken = function () {
    console.log("hi");
    const payload = {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
    };

    const secret = '123'; // Replace with your actual secret key
    const expiresIn = '1d';

   return jwt.sign(payload, secret, { expiresIn });
}

// ACCESS_TOKEN_SECRET=123
// ACCESS_TOKEN_EXPIRY=1d
// EXPIRY_TOKEN_SECRET=CODEKARO
// EXPIRY_TOKEN_EXPIRY=10d


userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
     _id:this._id,
     email:this.email,
     username:this.username,
     fullname:this.fullname,
    },
 'CODEKARO',{
     expiresIn:'10d'
 })
}

// userSchema.method.generateAccessToken=function(){}

export const User=mongoose.model("User",userSchema);
