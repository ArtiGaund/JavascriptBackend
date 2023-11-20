// creating user routers
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";


const router = Router();
router.route("/register").post(registerUser)

//exporting the router
export default router;