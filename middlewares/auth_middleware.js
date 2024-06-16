import {asyncHandler} from "../utils/asynshandler.js";
import {Apierror} from "../utils/apierror.js";
import jwt from"jsonwebtoken";
import {User} from "../models/user.model.js";

export const verifyJWT= asyncHandler(async(req,res,next)=>{
   try {
      // console.log(req.cookies)
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    console.log(token);
    if(!token){
       throw new Apierror(401,"Unauthorized request");
    }

     
    const decodedToken = jwt.verify(token,'123');
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
 
    if(!user){
     throw new Apierror(401,"Invalid Access Token");
    }
    req.user=user;
    next();
   } catch (error) {
      // console.log("hello bud");
     throw new Apierror(401,error?.message || "Invalid access token");
   }

  

})