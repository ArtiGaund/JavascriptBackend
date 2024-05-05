// this middleware will verify user is there or not

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
// here res is not in used thats why _ is written instead of res
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // req have cookies access
        // if user is using mobile then it won't have access to cookies, thats why it will send the custom headers
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") // we only want token not Bearer, it will replace Bearer with empty space
        if(!token){
            throw new ApiError(401, "Unauthorized request!")
        }
        // asking using jwt whether this token is correct or not and all information in this token
        //verify(token,secretOfPublicKey)
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id) // _id only bz we are using reference in _id only
        .select("-password -refreshToken")
    
        if(!user){
            // NEXT_VIDEO: discuss about frontend
            throw new ApiError(401, "Invalid Access Token!")
        }
        //adding object in req
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access Token!")
    }
})