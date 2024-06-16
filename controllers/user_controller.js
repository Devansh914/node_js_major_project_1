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
            user.refreshToken= refreshToken;
            // console.log(user.refreshToken);
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
    throw new Apierror(500,"maafi malik todhi deer meh punha pyras karo pleag!");
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
       if(!(username || email)){
        throw new Apierror(400,"username or email is required");
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
    console.log(req.user._id);
    await User.findByIdAndUpdate(req.user._id,{

        $set:{
            refreshToken: null  //this removes the field from document
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
    // console.log("hello babe");
    const incomingRefreshToken = req.cookies.refreshToken|| req.body.refreshToken;
    //  console.log(req.cookie);
    // console.log(incomingRefreshToken);
    if(!incomingRefreshToken){
        throw new Apierror(401,"unauthorized request");
    }
    // console.log(incomingRefreshToken);
   try {
     const decodedToken = jwt.decode(incomingRefreshToken);
    //  console.log(decodedToken);
     const user = await User.findById(decodedToken._id);
    //  console.log(user.username);
     if(!user){
         throw new Apierror(402,"invalid refresh token");
     }
    //  console.log(user.refreshToken);
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
    // console.log("hell");
      throw new Apierror(401,error?.message || "invalid access token");
   }
})

const changeCurrentPassword= asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword}= req.body;
    const user = await User.findById(req.user?.id);
   const passwordcheck =  await user.isPasswordCorrect(oldpassword);

   if(!passwordcheck){
     throw new Apierror(401,"invalid old password");
   }

   user.password =  newpassword
   await user.save({validateBeforeSave:false});

   return res.status(200).json(
    new Apiresponse(200,{},"password changed successfully")
   );
 
})
const getUser= asyncHandler(async(req,res)=>{
    return res.status(200).json(new Apiresponse(200,req.user,"current user"));
   })

const updateAccountDetails= asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body;

    if(!(fullname && email)){
        throw new Apierror(401,"all fields are required");
    }
    // console.log(fullname,"  ",email);
    // console.log(req.user?._id);
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
         $set:{
            fullname:fullname,
            email:email
         }   
        },{new:true}).select("-password");
        // console.log(user.username);
        return res
        .status(200)
        .json(new Apiresponse(200,user,"account details updated successfully"));
})

const updateUseravatar= asyncHandler(async(req,res)=>{
       const avatarlocalpath = req.file?.path;

       if(!avatarlocalpath){
        throw new Apierror(400,"avatar file is missing");
       }
       const avatar = await uploadOnCloudinary(avatarlocalpath);

       if(!avatar){
         throw new Apierror(401,"avatar not uploaded on cloudinary");
       }

       const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            avatar:avatar.url
        }
       },{new:true}).select("-password")

       return res
              .status(200)
              .json(new Apiresponse(200,user,"avatar updated successfully"));
})

const updateUsercoverimg= asyncHandler(async(req,res)=>{
    const coverimglocalpath = req.file?.path;

    if(!coverimglocalpath){
     throw new Apierror(400,"coverimage file is missing");
    }
    const coverimg = await uploadOnCloudinary(coverimglocalpath);

    if(!coverimglocalpath){
      throw new Apierror(401,"coverimg not uploaded on cloudinary");
    }

    await User.findByIdAndUpdate(req.user._id,{
     $set:{
         coverImage:coverimg.url
     }
    },{new:true}).select("-password")

    return res.status(200)
           .json(new Apiresponse(200,coverimg,"coverimg is successfully updated"));
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
       const {username} = req.params;

       if(!username?.trim()){
        throw new Apierror(400,"username is missing");
       }

       const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },{
            $lookup:{
                from:"Subscription",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribed_to"
            }
        },{
            subscribersCount:{
                $size:"$subscribers"
            },
            channelsSubscribedToCount:{
                $size:"$subscribed_to"
            },
            isSubscribed:{
                  $cond:{
                      if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                      then: true,
                      else: false
                  }
            }
        },
        {
            $project:{
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
       ])

       if(!channel?.length){
         throw new Apierror(404,"channel does not exists");
       }

       return res
       .status(200)
       .json(
           new Apiresponse(200,channel[0],"user channel fetched successfully")
       )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
     const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.Object(req.user._id)
            }
        },
        {
             $lookup:{ 
                 from:"video",
                 localField:"watchHistory",
                 foreignField:"_id",
                 as:"watchHistory",
                 pipeline: [
                     {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                     },{
                        $addFields:{
                            owner:{
                                $first : "$owner"
                            }
                            
                        }
                     }
                    ]
             }
        }
     ])

     return res.status(200)
            .json(
                new Apiresponse(
                    200,user[0].WatchHistory,"watch history fetched successfully"
                )
            )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUser,
    getUserChannelProfile,
    getWatchHistory,
    changeCurrentPassword,
    updateUsercoverimg,
    updateUseravatar,
    updateAccountDetails
    }