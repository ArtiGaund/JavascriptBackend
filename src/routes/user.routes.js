// creating user routers
import { Router } from "express";
import {
     loginUser, 
     logoutUser,
     registerUser, 
     refreshAccessToken,
     changeCurrentPassword, 
     getCurrentUser, 
     updateAccountDetails, 
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchHistory 
} from "../controllers/user.controller.js";
//for file handling
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar", // when this field is created in frontend, its name also be avatar
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )


router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post( verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
// patch when only one field is to be updated
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
// getting value from params, we already used username in controller then we have to use as it is
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)
//exporting the router
export default router;