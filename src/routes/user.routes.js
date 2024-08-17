import {Router} from "express"
import {loginUser, logoutUser, registerUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middlewere.js";
const router = Router();

//http//localhost:8000/users/register
router.route("/register").post(
    upload.fields([                     //using middlewhere for image and avtar
        {name:"avatar", maxCount: 1},
        {name: "coverImage",maxCount:1}
    ]),
    registerUser // the function
)    

router.route("/login").post(loginUser)

//Secured Routes

router.route("/logout").post(verifyJWT,logoutUser)

export default router