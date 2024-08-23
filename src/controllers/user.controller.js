import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js" 
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import  ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

// here we are making function to register the user
const registerUser = asyncHandler ( async ( req , res ) => {
    // 1 get User detail from front-end
    // 2 validate the input - not empty
    // 3 check if user already exists : check usernmae and email
    // 5 check for images, check for avatar(compulsory) 
    // if they are there, put them in cloudinary
    // 4 hash password
    // 6 create user object - create entry in db
    // 7 remove password and refresh token field from response
    // 8 check for user creation // return res

    //1
    const {fullName,email,username,password} = req.body 
    console.log(req.body)

    //2 
    // if(fullName === ""){
    //     throw new ApiError(400,"full name is required") for the begineer way to check
    // }
    // ADVANCE WAY TO CHECK EVERY FIELD
    // some(), it return the true value to the condition we give to each element of the array
     if(
        [fullName,email,username,password].some((field) =>
         field?.trim() === ""))
        {
        throw new ApiError(400,"Please fill all the fields")
        }
        //3
        const existedUser = await User.findOne({ //mongoose to find email or that passowrd
          $or:[{username},{email}]  
        })

        if(existedUser){
            throw new ApiError (409,"User with email or username already exist")
        }
        //4   // here we will use multer 
        // we are getting the localPath of both of it, but these we do get sometimes or we dont
        // soo thats why we using ? 

   
       const avatarLocalPath =  req.files?.avatar[0]?.path;
    // const coverImagepath = req.files?.coverImage[0]?.path;
       console.log(req.files);

       let coverImagePath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            coverImagePath = req.files.coverImage[0].path
        }

       if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
       }

       //5
       // here we are uploading the image to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImagePath);

    if(!avatar){
        throw new ApiError(400,"Avatar upload failed")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // if coverimage aint there,
        email,
        password,
        username: username.toLowerCase()
    })
    //here we are checking that is the user is created or nah, using its ID
    // and we'll get the data again back to the front end, without the password and the refresh token

    const createdUser =  await User.findById(user._id).select(
        //7 selected everything minus password and refresh token
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
    
    
})


// making a method to generate refresh and access token
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User with ID ${userId} not found`);
            throw new ApiError(404, "User not found");
        }

        console.log("User found:", user);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        console.log("Generated Access Token:", accessToken);
        console.log("Generated Refresh Token:", refreshToken);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // we dont want to save things again
        // we just want to update the refresh token 

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error.message, error.stack);
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};


const loginUser = asyncHandler(async (req,res)=>{
    // 1 get username or email (can make user login from both) and password from the user
    // 2 check if both of them are not empty
    // 3 go to the databasea and check if we can find them or not
    // 4 if not then give them error and tell them to go register
    // 5 then check the password, if they dont match, then give them error
    // 6 if its good then 
    // make access and refresh tokens and 
    // send them in cookies
    
    const {email,username,password} = req.body
    if(!(email || username)){
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({ 
        $or: [{ email: email }, { username: username }]
    });

   if(!user){
    throw new ApiError(400,"username or email is incorrect")
   }
   //check if the password is correct or not
   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credential")
   }
   // if all is good then generate access and refresh token and send them in cookies
   const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); // here we are looking for the user which we 
   //checked before , and taking its _id, to find it 

   //cookies options
   const options = {
    httpOnly: true, // making httponly true give access to the server only to change the cookie cuz cookies can be changed from the url
    secure:true
}
    return res.status(200)
    .cookie("accessToken",accessToken,options) //setting up cookies
    .cookie("refreshToken",refreshToken,options) 
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser,accessToken,refreshToken

            },
            "User logged in successfully"
        )
    )

})
const logoutUser = asyncHandler(async(req,res)=>{
    // here we are removing the cookies from the user's browser
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken:undefined}
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly: true, // making httponly true give access to the server only to change the cookie cuz cookies can be changed from the url
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res) =>{
   const incomngRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

   if(!incomngRefreshToken) {
    throw new ApiError(401,"Unauthorized request")
   }
   try {
    const decodedToken = jwt.verify(incomngRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
    const user = await User.findById(decodedToken?._id)
 
    if(!user) {
     throw new ApiError(401,"Invalid refresh token")
    }
 
    if(incomngRefreshToken !== user?.refreshToken){
     throw new ApiError(401,"Refresh Token is expired or user")
    }
 
    const options = {
     httpOnly: true, // making httponly true give access to the server only to change
     secure:true     
    }
 
    const {newRefreshToken,accessToken} = await generateAccessAndRefreshTokens(user._id)
 
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
     new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token Refreshed")
    )
   } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
   }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body //taking old and new password
    const user = await User.findById(req.user?._id)
    //finding the user by getting the userId from auth
    //logically if user can change the password then surely it is logged in
    //so here we use the auth req.user where we got the user by taking cookie from the 
    //user
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    //changing the password of the user
    await user.save({validateBeforeSave:false}) //now save again 

    return res.status(200).json(new ApiResponse(200,{},"password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req,res) => {
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"current user fetched successfully"))
})


const updateAccountDetails = asyncHandler(async (req,res) => {
    const {fullName,email} = req.user
    //getting the user details from the auth req.user
    if(!fullName || email){
        throw new ApiError(400,"Please fill all the fields")
    }
    //checking if the fields are empty or not
    //finding the user by getting the userId from auth
    //logically if user can change the password then surely it is logged in
    //so here we use the auth req.user where we got the user by taking cookie from the
    //user
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName:fullName,email:email
            }
        },{new:true}
    ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Account details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // Fetch the user to get the current avatar URL
    const user = await User.findById(req.user?._id).select("avatar");

    // If the user has an existing avatar, delete it from Cloudinary
    if (user.avatar) {
        const publicId = getPublicIdFromUrl(user.avatar); // Extract public ID from URL
        await deleteFromCloudinary(publicId); // Delete the avatar from Cloudinary
    }

    // Upload the new avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    // Update the user document with the new avatar URL
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Avatar image updated successfully")
        );
});

// Helper function to extract public ID from Cloudinary URL
function getPublicIdFromUrl(url) {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.split('.')[0]; // Remove the file extension to get the public ID
}

// Helper function to delete a file from Cloudinary
async function deleteFromCloudinary(publicId) {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    if (result.result !== 'ok') {
        throw new ApiError(400, "Failed to delete old avatar from Cloudinary");
    }
}


const updateUserCoverImage = asyncHandler(async (req,res) => {
    const coverImageLocalPath = req.file?.path //multer middlewere
    //getting the path of the uploaded file
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image file not found")
    }

    const cover = await uploadOnCloudinary(coverImageLocalPath)

    if(!cover.url){
        throw new ApiError(400,"Avatar upload failed")
    }

   const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:cover.url
            } 
        },{new:true}
    ).select("-password")
    return res.status(200).
    json(new ApiResponse(200,user,"cover updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username}  = req.params
    if(!username?.trim()){
        throw new ApiError(400,"username is required")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscription",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscription",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"

            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers" // counting the size of the subscribers
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo" // counting the size of the channels subscribed to
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"subscribers.subscriber"]},
                        then:true,
                        else:false
                        //here , we checked if req.user? have subscriber
                        // then send true else false
                    }
                }
            }
        },
        {   // the values which we need  
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,

            }
        }
        
    ])
    console.log(channel);// gives the list of objects which gets match
    // we will get single object in list,cuz user is one

    if(!channel?.length){
        throw new ApiError(400,"channel does not exist")
    }
    return res.status(200)
    .json(new ApiResponse(200),channel[0],"User Channel Fetched Successfully")
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: mongoose.Types.ObjectId(req.user?._id)
                // when we get the user._id from mongodb, we get the string
                // so we need to convert it to ObjectId, so we can look up
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[{
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    }
                },{
                    $addFields:{
                        owner:{$arrayElemAt:["$owner",0]} // to get the first element of array
                    }
                }]
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"Watch History Fetched Successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory,
    getUserChannelProfile
}