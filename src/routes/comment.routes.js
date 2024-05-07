import { Router } from "express"

import { verifyJWT } from "../middlewares/auth.middleware.js"
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js"

const router = Router()

// to use comment controller, user should be login
// applying verifyJWT middleware to all the route of this controller
router.use(verifyJWT)

router.route("/:videoId").get(getVideoComments).post(addComment)
router.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default router

