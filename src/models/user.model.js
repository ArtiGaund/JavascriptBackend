import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // to make this field searchable
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, //cloudinary url
            required: true,
        },
        coverImage: {
            type: String, //cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        password: {
            type: String,
            required: [ true, "Password is required"]
        },
        refreshToken: {
            type: String,
        },
    }
, {timestamps: true})
//password encryption
userSchema.pre("save", async function ( next ) {
    // encrypting password field before save
    if( !this.isModified("password")) return next()

    this.password = bcrypt.hash(this.password,10)
    next()
})


//custom methods
//methods is object
userSchema.methods.isPasswordCorrect = async function(password){
    // password given by user, this.password encrypted password by bcrypt
    return await bcrypt.compare(password, this.password)
}

// method for generateAccessToken
userSchema.methods.generateAccessToken =  function() {
    // sign generate the token
    // payload - what information to be kept
   return jwt.sign(
        {
            //payload
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            // expiry goes inside object
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
// method for generateRefreshToken
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            //payload
            //its keep refreshing that's why only taking id
            _id: this._id,
        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
            // expiry goes inside object
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}
export const User = mongoose.model("User", userSchema)