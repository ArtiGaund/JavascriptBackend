// using helper (utils) wrapper
import { asyncHandler } from "../utils/asyncHandler.js"
// error api file
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

// method for user registration
const registerUser = asyncHandler ( async ( req, res ) => {
    //1) get user details from frontend
    //2) validation-  not empty
    //3) check if user exist: username, email
    //4) check for images, check of avatar(required field)
    //5) upload them to cloudinary, avatar
    //6) create user object - create entry in db
    //7) remove password and refresh token field from response
    //8) check for user creation (null response or user created)
    //9) return response

    // we get user details in req.body (its not compulsory we always get data from req.body, it can come from url, form)
    // req.body can be used if data is coming from json or form 
    //step. 1) getting details from user
    const { username, email, fullName, password} = req.body
    console.log("email: ",email);
    //step 2) Validation
    if (
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    // TODO: email validation (proper email)
    //step 3) user already exist or not
    //User can directly contact to db
    const existedUser = User.findOne({
        $or: [ { username }, { email } ]
    }) // return first user who have this value, it will check either same username exist or same email exist
    if(existedUser){
        throw new ApiError(409, "User with email or username already exist.")
    }
    // step 4) check for images, check for avatar
    // we have all the data in req.body, but we have added middleware in routes (user.routes.js), it also give some
    // access(it add more fields in req)
    // req.body by default given by express, req.files is given by multer(middleware)
    // this file is on our server /public/temp
    const avatarLocalPath = req.files?.avatar[0]?.path; // avatar have many field like type, size, etc, we are fetching path (url)
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required!")
    }
    //step 5) upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // checking if uploaded correctly or not
    if(!avatar){
        throw new ApiError(400, "Avatar is required!")
    }
    // step 6)  create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    //ste7 & 8) check if user is created or not, if found remove password and refresh token from it
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // - means we don't want it
   )
   if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user.")
   }
   // step 9) return user
   return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully.")
   )
})  

export {registerUser};