import {Router} from "express"
import {registerUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
const router = Router();

//http//localhost:8000/users/register
router.route("/register").post(
    upload.fields([                     //using middlewhere for image and avtar
        {name:"avatar", maxCount: 1},
        {name: "coverImage",maxCount:1}
    ]),
    registerUser // the function
)    

export default router