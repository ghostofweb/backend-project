// here we are using this as a middlewher for the logout, where we will get if the user is logged in
//or not , 

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models";

export const verifyJWT =  asyncHandler( async ( req , res , next )=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer","")
        // we take cookies from the loggedInUser to see if its our database or nah
    
        if(!token){
            throw new ApiError(401,"Unauthorized Error")
        }
    
        const decodedTokenInfo = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        // we are verifying the token here , if its not valid we will get an error
        // we are using the secret key to verify the token , this secret key is stored in the
        // environment variable , so we can't see it in the code , so its safe
    
        const user = User.findById(decodedTokenInfo?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
// we take cookies from the loggedInUser, and then we verify it and get the decodedToken info, then we 
//search for that user using the token in the database and then we find the user
    req.user = user;
    // here we got are making new attribute in the req object (cuz at the end user is also an object)
    // so we can use user to log it out
        next(); // to go to next method or middlewere
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token")
    }
})