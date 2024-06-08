import {Router} from "express";
import {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUser,
    getUserChannelProfile,
    getWatchHistory,
    changeCurrentPassword,
    updateUsercoverimg,
    updateUseravatar,
    updateAccountDetails} from "../controllers/user_controller.js";
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
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getUser);
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUseravatar);
router.route("/update-coverimg").patch(verifyJWT,upload.single("coverImage"),updateUsercoverimg);
router.route("/c/:username").get(verifyJWT,getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistory);

export default router