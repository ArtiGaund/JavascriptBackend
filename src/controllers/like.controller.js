import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //1) if videoId not found return error
    // 2) check if video is present in the database
    // 3) check if already liked by user then delete it and return 
    //  4) then like the video
    try {
        if(!videoId){
            throw new ApiError(400, "Video url is required")
        }
        const video = await Video.findById(videoId)
        if(!video || !video.isPublished){
            throw new ApiError(400, "Video does not exist in database")
        }
    
        const alreadyLiked = await Like.find({
            video: videoId,
            likedBy: req.user?._id
        })
        // already liked then dislike it
        if(alreadyLiked && alreadyLiked.length>0){
            await Like.findByIdAndDelete(alreadyLiked, { new : true })
            return res
            .status(200)
            .json( new ApiResponse(200, "Disliked successfully."))
        }
        const videoLike = await Like.create({
            likedBy: req.user?._id,
            video: videoId
        })
        if(!videoLike){
            throw new ApiError(400, "Error while liking the video.")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, videoLike, "Liked successfully.")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
   

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //1) find if comment id exist, if not return error
    // 2) check if comment is present in the database
    // 3) check if already liked, then dislike
    // 4) like the comment
    try {
        if(!commentId){
            throw new ApiError(400, "comment id is required")
        }
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new ApiError(400, "comment doesn't exist in database")
        }

        // checking if already liked
        const alreadyLikedComment = await Like.find({
            comment: commentId,
            likedBy: req.user?._id
        })
        if(alreadyLikedComment && alreadyLikedComment.length > 0){
            await Like.findByIdAndDelete(alreadyLikedComment, { new: true})
            return res
            .status(200)
            .json(new ApiResponse(200, "Successfully disliked comment."))
        }

        const commentLike = await Like.create({
            likedBy: req.user?._id,
            comment: commentId
        })
        if(!commentLike){
            throw new ApiError(400, "Error while liking the comment.")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, commentLike, "Liked comment successfully.")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    try {
        if(!tweetId){
            throw new ApiError(200, "tweet id is required")
        }
        const tweet = await Tweet.findById(tweetId)
        if(!tweet){
            throw new ApiError(200, "tweet doesn't exist in database")
        }
        // already liked
        const alreadyLikedTweet = await Like.find({
            tweet: tweetId,
            likedBy: req.user?._id
        })
        if(alreadyLikedTweet && alreadyLikedTweet.length > 0){
            await Like.findByIdAndDelete(alreadyLikedTweet, { new: true})
            return res
            .status(200)
            .json(200, "Successfully disliked tweet.")
        }
        const tweetLiked = await Like.create({
            likedBy: req.user?._id,
            tweet: tweetId
        })

        if(!tweetLiked){
            throw new ApiError(400, "Error while liking the tweet.")
        }

        return res
        .status(200)
        .json(200, tweetLiked, "Liked tweet successfully.")
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        const likedVideosByUser = await Like.aggregate(
            {
                $match:{
                    likedBy: req.user?._id
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedVideos"
                }
            },
            {
                $unwind: "$likedVideos"
            },
            {
                $project: {
                    likedVideos: 1
                }
            }
        )
        if(!likedVideosByUser){
            throw new ApiError(400, "User has not liked any videos yet.")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideosByUser, "Liked videos fetched successfully.")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}