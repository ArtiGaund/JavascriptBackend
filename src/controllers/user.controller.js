// using helper (utils) wrapper
import { asyncHandler } from "../utils/asyncHandler.js"


// method for user registration
const registerUser = asyncHandler ( async ( req, res ) => {
    res.status(200).json({
        message: "Configuration done",
    })
})

export {registerUser};