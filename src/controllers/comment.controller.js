import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    // if videos id not found
    try {
        if(!videoId){
            throw new ApiError(404, "Videos url not found")
        }
        // check if video is present in the database
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(400, "Video not found")
        }
    
        const allComments = await Comment.aggregate(
            {
                $match: {
                    video:new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lockup: {
                    from: "user",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                },
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    }
                }
            },
            {
                $lookup: {
                    from: "like",
                    localField: "_id",
                    foreignField: "comment",
                    as: "likedBy"
                }
            },
            {
                $skip: (page-1)*limit
            },
            {
                $limit: limit
            }
        )
    
        if(!allComments || !allComments.length>0){
            throw new ApiError(404, "No comments found")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, allComments[0], "Comments fetched successfully.")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
   
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } =req.params
    const { newComment } = req.body
    try {
        if(!videoId){
            throw new ApiError(400, "Video url is required.")
        }
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(400, "Video is not found in the database.")
        }

        if(!newComment){
            throw new ApiError(400, "Comment is required.")
        }
    
        const comment = await Comment.create({
            content: newComment,
            video: video?._id,
            owner:req.user?._id
        })
    
        if(!comment){
            throw new ApiError(400, "Error occur while adding comment.")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment added successfully.")
        )
        
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { newComment } = req.body
    try {
        if(!commentId){
            throw new ApiError(400, "Comment id is required")
        }
        if(!newComment){
            throw new ApiError(400, "New comment is required")
        }

        const comment = await Comment.findById(commentId)

        if(!comment){
            throw new ApiError(400, "comment not existed while updating")
        }
   
        const updatedComment = await Comment.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    content: newComment
                }
            },
            { new: true }
        )
        if(!updatedComment){
            throw new ApiError(400, "Error while updating comment")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated successfully.")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    try {
    const { commentId } = req.params
        if(!commentId){
            throw new ApiError(400, "Comment id is required")
        }
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new ApiError(400, "Comment is not existed while deleting")
        }
   
        const deleteComment = await Comment.findByIdAndDelete(commentId)
        if(!deleteComment){
            throw new ApiError(400, "Error occur while deleting the comment")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Comment deleted successfully")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}