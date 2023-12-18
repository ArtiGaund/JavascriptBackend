// using helper (utils) wrapper
import { asyncHandler } from "../utils/asyncHandler.js"
// error api file
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

// method to generate access and refresh token
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // find user
        const user = await User.findById(userId)
        //generate the tokens
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //adding refresh token into database as well (adding value in object)
        user.refreshToken = refreshToken
        //saving user, when value is saved here mongos model is kickin, means password field is also kickin, password is required
        // validateBeforeSave is used which is false, means no validate to be added, directly save the value
        await user.save({ validateBeforeSave: false})
        // returning access and refresh token 
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token!")
    }
}

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
    // console.log("email: ",email);
    //step 2) Validation
    if (
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    // TODO: email validation (proper email)
    //step 3) user already exist or not
    //User can directly contact to db
    const existedUser =await User.findOne({
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
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
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

const loginUser = asyncHandler( async ( req, res) => {
//TODOs: 1) fetch data from req body
      // 2) username or email is provided or not
      // 3)find the user
      // 4) check password
      // 5) generate access and refresh token and given to the user
      // 6) send these tokens in cookies
      // 1) fetching data from req body
      const { email, username, password } = req.body
      // 2) email or username is not provided
      if( !username || !email){
        throw new ApiError(400, "username or email is required!")
      }
      // 3) finding user in database
      // $or... these are mongoDB operators in these we can pass object 
      const user = await User.findOne({
         // this or operator will find one value which is either based on username or email
        $or: [{ username }, { email }]
      })
      // no value found means user is not registered
      if(!user){
        throw new ApiError(404, " User does not exist! ")
      }
      // 4) check password
      // User is mongos object, to access methods of mongoDB User is used like findOne, findId...
      // here user is used to access our methods which we have created like generateAccessToken, isPasswordCorrect
      const isPasswordValid =  await user.isPasswordCorrect(password) 
      if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials!")
      }
      // 5) generate access Token and refresh Token
     const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
     // 6) send these tokens in cookies
     // what all information to be given to user, there are many unwanted fields like password is never sended to user
     // refresh token in user is actually empty because its fetched before generating refresh token
      //here database query is done, its depend upon the developer to decide whether this database query is expensive
      // if its expensive then update by user.refreshToken = refreshToken otherwise do by database query
      const loggedInUser = await User.findById(user._id)
      .select("-password -refreshToken ")
      //sending cookies
      const options = {
        // by httpOnly and secure, these cookies is only modified by server, from frontend it cannot be modified
        // we can see them but not modifiable
        httpOnly: true,
        secure: true
      }
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
            200,
            {
                // these values will help the user to store these tokens in localstorage, or using in mobile there
                // cookies will not be set
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In successfully!"
        )
      )


})

const logoutUser = asyncHandler( async ( req, res) => {
    // now we have access of req.user
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        // by httpOnly and secure, these cookies is only modified by server, from frontend it cannot be modified
        // we can see them but not modifiable
        httpOnly: true,
        secure: true
      }

      //clearing cookies
      return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User Logged Out Successfully!"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
}