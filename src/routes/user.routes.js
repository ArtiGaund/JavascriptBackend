// creating user routers
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
//for file handling
import { upload } from "../middlewares/multer.middleware.js"

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

//exporting the router
export default router;