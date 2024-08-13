import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js" 
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { response } from "express"
import  ApiResponse from "../utils/ApiRespone.js"
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

export {registerUser};