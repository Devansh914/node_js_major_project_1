import {asyncHandler} from "../utils/asynshandler.js";
import {Apierror} from "../utils/apierror.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {Apiresponse} from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId)=>{
    try{
            const user = await User.findById(userId);
            
            const accessToken=user.generateAccessToken();
            const refreshToken=user.generateRefreshToken();
            // console.log(user);
            user.refreshToken= refreshToken;
            await user.save({validateBeforeSave:false});

            return {accessToken,refreshToken};
    }catch(error){
        throw new Apierror(500,"something went wrong while generating refresh and access token");
    }
}

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
   console.log("password",password);
   console.log("fullname",fullname);
   console.log("username",username);


   if(
    [fullname,email,username,password].some((field) => field?.trim() === "")
   ){
      throw new Apierror(400,"All fields are required");
   }

   const existedUser = await User.findOne({
    $or: [{username},{email}]
   })

   if(existedUser){
      throw new Apierror(409,"User with email and username exists");
   }
   
   const avatarLocalPath = req.files?.avatar[0]?.path;
  
   console.log("avatar",avatarLocalPath);
//    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath=req.files.coverImage[0].path
    }
   
   if(!avatarLocalPath){
    throw new Apierror(400,"Avatar file is required");
   }
  
   const avatar= await uploadOnCloudinary(avatarLocalPath);
   const coverImage= await uploadOnCloudinary(coverImageLocalPath);
   console.log("/n avatar",avatar);
  
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
   "-watchHistory -refreshToken");

   if(!createdUser){
    throw new Apierror(500,"fuckk offf!");
}

    return res.status(201).json(
           new Apiresponse(200,createdUser,"User registered successfully")
    )
})

const loginUser=asyncHandler( async (req,res) =>{
       // req body ->data
       // username or email check
       // check if user exists
       // password check
       // access and refresh token
       // send cookie

       const {username,email,password}=req.body;
       if(!(username && email)){
        throw new Apierror(400,"username or password is required");
       }

      const user = await User.findOne({
        $or:[{username},{email}]
       })
    //    console.log(user);
       if(!user){
         throw new Apierror(404,"User does not exist");
       }

       const isPasswordValid = await user.isPasswordCorrect(password);
       if(!isPasswordValid){
        throw new Apierror(401,"wrong user creditals");
       }
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

        const loggedInUser= await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly:true,
            secure:true
        }
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new Apiresponse(
                200,{
                    user:loggedInUser,
                    accessToken,refreshToken
                },"User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined
        }
    },{
        new:true
    })

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accesToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new Apiresponse(200,{},"user logged out successfully")
    )
})

const refreshAccessToken= asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken|| req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new Apierror(401,"unauthorized request");
    }
   try {
     const decodedToken = jwt.verify(incomingRefreshToken,process.env.ACCESS_TOKEN_SECRET);
     const user = User.findById(decodedToken._id);
     
     if(!user){
         throw new Apierror(402,"invalid refresh token");
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
         throw new Apierror(401,"refresh token is expired or used");
     }
 
     const options={
         httpOnly:true,
         secure:true
     }
       const {accessToken,newrefreshToken} = await generateAccessAndRefreshToken(user._id);
 
       return res.status(200)
       .cookie("refreshToken",newrefreshToken,options)
       .cookie("AccessToken",accessToken,options)
       .json(
         new Apiresponse(
             200,
             {accessToken,refreshToken:newrefreshToken},
             "Access token refreshed"
         )
     )
   } catch (error) {
      throw new Apierror(401,error?.message || "invalid access token");
   }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken}