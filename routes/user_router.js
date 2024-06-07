import {Router} from "express";
import {registerUser,loginUser,logoutUser, refreshAccessToken} from "../controllers/user_controller.js";
import {upload} from "../middlewares/multer.js";
import {verifyJWT} from "../middlewares/auth_middleware.js";

const router= Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxcount:1
        }
    ]),registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route(".refresh-token").post(refreshAccessToken);

export default router