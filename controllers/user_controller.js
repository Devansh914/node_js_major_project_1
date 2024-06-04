import {asyncHandler} from "../utils/asynshandler.js";
import {Apierror} from "../utils/apierror.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {Apiresponse} from "../utils/Apiresponse.js";

const registerUser=asyncHandler( async (req,res)=>{
    //get user details from frontend
    //validation - not empty
    //check if user already exists: using username,email
    //check for images,check for avatar
    //upload them to cloudinary,avatar
    //create user object- create entry in db
    //remove password ad refresh token field from response
    //check for user creation
    //return res

   const {fullname,email,username,password} = req.body;
   console.log("email: ",email);

   if(
    [fullname,email,username,password].some((field) => field?.trim() === "")
   ){
      throw new Apierror(400,"All fields are required");
   }

   const existedUser = User.findOne({
    $or: [{username},{email}]
   })

   if(existedUser){
      throw new Apierror(409,"User with email and username exists");
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
    throw new Apierror(400,"Avatar file is required");
   }

   const avatar= await uploadOnCloudinary(avatarLocalPath)
   const coverimg= await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
    throw new Apierror(400,"Avatar file is required");
   }

   const user= await  User.create({
       fullname,
       avatar:avatar.url,
       coverImage: coverImage?.url || "",
       email,
       password,
       username:username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
   "-password -refreshToken");

   if(!createdUser){
    throw new Apierror(500,"something went wrong while registering the user");
}

    return res.status(201).json(
           new Apiresponse(200,createdUser,"User registered successfully")
    )
})



export {registerUser}