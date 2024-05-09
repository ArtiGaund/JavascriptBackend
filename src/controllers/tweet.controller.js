import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

   try {
        const { data } = req.body;
        if(!data){
            throw new ApiError(400, "Data is required")
        }
        const tweet = await Tweet.create({
            content: data,
            owner: req.user?._id
        })
        if(!tweet){
            throw new ApiError(400, "Error while creating tweet.")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "Tweet created successfully")
        )
   } catch (error) {
        throw new ApiError(400, error?.message)
   }
})

const getUserTweets = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        if(!userId){
            throw new ApiError(400, "User id is required")
        }
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(400, "User does not exist")
        }
        const tweets = await Tweet.aggregate([
            {
                $match:{
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $project:{
                    content: 1,
                }
            }
        ])
        if(!tweets){
            throw new ApiError(400, "Error while fetching user tweets.")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, tweets, "User tweets fetched successfully")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params
        const { updateData } = req.body
        if(!tweetId){
            throw new ApiError(400, "Tweet id is required")
        }
        if(!updateData){
            throw new ApiError(400, "Data to be updated is required")
        }
        const tweet = await Tweet.findById(tweetId)
        if(!tweet){
            throw new ApiError(400, "Tweet does not exist.")
        }
        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set:{
                    content: updateData
                }
            },
            {new: true}
        )
        if(!updateData){
            throw new ApiError(400, "Error while updating the tweet.")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, updatedTweet, "Tweet updated successfully")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params
        if(!tweetId){
            throw new ApiError(400, "Tweet id is required")
        }
        const tweet = await Tweet.findByIdAndDelete(tweetId)
        if(!tweet){
            const findTweet = await Tweet.findById(tweetId)
            if(!findTweet){
                throw new ApiError(400, "Tweet does not exist")
            }
            throw new ApiError(400, "Error while deleting tweet.")
        }
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}