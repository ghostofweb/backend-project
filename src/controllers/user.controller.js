import {asyncHandler} from "../utils/asyncHandler.js"


// here we are making function to register the user
const registerUser = asyncHandler ( async ( req , res ) => {
    res.status(200).json({
        message:"ok"
    })
})

export {registerUser};