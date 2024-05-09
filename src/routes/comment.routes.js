import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    addComment, 
    deleteComment, 
    getVideoComments, 
    updateComment 
} from "../controllers/comment.controller.js";

const router = Router()
// using this middleware bz we want to user to be login
router.use(verifyJWT)

router.route("/:videoId").get(getVideoComments).post(addComment)
router.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default router