import {Router} from "express"
import {loginUser, logoutUser, registerUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middlewere.js";
const userRouter = Router();

//http//localhost:8000/users/register
userRouter.route("/register").post(
    upload.fields([                     //using middlewhere for image and avtar
        {name:"avatar", maxCount: 1},
        {name: "coverImage",maxCount:1}
    ]),
    registerUser // the function
)    

userRouter.route("/login").post(loginUser)

//Secured Routes

userRouter.route("/logout").post(verifyJWT,logoutUser)

export default userRouter