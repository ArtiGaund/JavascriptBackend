import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    try {
        if(!videoId){
            throw new ApiError(400, "Video id is required")
        }
        // checking video is in database
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(400, "Video does not exist in the database")
        }
        // checking if user have already liked the video
        const alreadyLiked = await Like.findOne({
            video: videoId,
            likedBy: req.user?._id
        })
        // if like => unlike
        if(alreadyLiked){
            await Like.findByIdAndDelete(alreadyLiked._id, {new: true})
            return res
            .status(200)
            .json(
                new ApiResponse(200, {},"Unliked the video successfully." )
            )
        }
        // not like => like
        const likeVideo = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })
        if(!likeVideo){
            throw new ApiError(400, "Error while liking the video")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, likeVideo, "Liked the video successfully.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    try {
        if(!commentId){
            throw new ApiError(400, "Comment id is required")
        }
        // check if comment is present in the db
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new ApiError(400, "Comment does not exist in the database")
        }
        // check if user have already liked the comment
        const alreadyLikedComment = await Like.findOne({
            comment: commentId,
            likedBy: req.user?._id
        })
        // if like => unlike
        if(alreadyLikedComment){
            await Like.findByIdAndDelete(
                alreadyLikedComment?._id,
                {new: true}
            )
            return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Successfully dislike the comment")
            )
        }
        // not like => like
        const likeComment = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })
        if(!likeComment){
            throw new ApiError(400, "Error while liking the comment")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, likeComment, "Successfully liked the comment.")
        )
    } catch (error) {
        throw new ApiError(404, error?.user)
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
   try {
        if(!tweetId){
            throw new ApiError(400, "Tweet id is required")
        }
        // checking tweet is present in db or not
        const tweet = await Tweet.findById(tweetId)
        if(!tweet){
            throw new ApiError(400, "Tweet does not exist in the database")
        }
        // checking if user have already liked the tweet
        const alreadyLikedTweet = await Like.findOne({
            tweet: tweetId,
            likedBy: req.user?._id
        })
        // if like => unlike
        if(alreadyLikedTweet){
            await Like.findByIdAndDelete(
                tweetId,
                {new: true}
            )
            return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Successfully unliked the tweet")
            )
        }
        const likeTweet = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })
        if(!likeTweet){
            throw new ApiError(400, "Error while liking the tweet")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, likeTweet, "Successfully liked the tweet.")
        )
   } catch (error) {
        throw new ApiError(404, error?.message)
   }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        const likedVideos = await Like.aggregate([
            {
                $match: {
                    likeBy: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup:{
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedvideos"
                }
            },
            {
                $unwind: "$likedvideos"
            },
            {
                $project:{
                    likedVideos: 1,
                }
            }
        ])
        if(!likedVideos){
            return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "User have not liked any video yet.")
            )
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "Successfully fetched user liked videos.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}