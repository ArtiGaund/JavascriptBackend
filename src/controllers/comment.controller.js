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
    try {
        // if videoId is not given by user
        if(!videoId){
            throw new ApiError(400, "Video id is required")
        }
        // checking video is in database
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(400, "Video is not present.")
        }
        // it will add in Comment model, the owner(user) field with the comment
        const allComments = await Comment.aggregate(
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId) //matching video id of Comment model
                    // with video id of Video model
                }
            },
            {
                $lookup: {
                    from: "users", //search in users model
                    localField: "owner", //this field is in Comment model
                    foreignField: "_id", //this field is in User model
                    as: "owner" //giving name
                }
            },
            {
                $addField:{
                    // adding field of owner with user details in it
                    owner: {
                        $first: "$owner"
                    }
                }
            },
            {
                $skip:(page-1)*limit
            },
            {
                $limit: limit
            }
        )
        if(!allComments){
            throw new ApiError(400, "Error while fetching all comments for a video.")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, allComments, "All comments for video fetched successfully")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }

})

const addComment = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        const { data } = req.body
        if(!videoId){
            throw new ApiError(400, "Video id is required")
        }
        if(!data){
            throw new ApiError(400, "Comment is required to be added in video")
        }
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(400, "Video of this id does not exist")
        }
        const addedComment = await Comment.create({
            content: data,
            video: videoId,
            owner: req.user._id
        })
        if(!addedComment){
            throw new ApiError(400, "Error while adding comment to video")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, addedComment, "Comment added to video successfully.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    try {
        const { commentId } = req.params
        const { newComment } = req.body
        if(!commentId){
            throw new ApiError(400, "Comment id is required for the updation")
        }
        if(!newComment){
            throw new ApiError(400, "New comment is required for updation")
        }
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new ApiError(400, "Comment does not exist on the video to be updated")
        }
        const updatingComment = await Comment.findByIdAndUpdate( 
            commentId,
            {
                $set:
                {
                    content: newComment,
                }
            },
            {new : true}
        )
        if(!updatingComment){
            throw new ApiError(400, "Error occur while updating the comment on the video")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, updateComment, "Comment updated successfully on the video")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    try {
        const { commentId } = req.params
        if(!commentId){
            throw new ApiError(400, "Comment id is required to delete it from the video")
        }
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new ApiError(400, "Comment does not exist to be deleted from the video")
        }
        const deletedComment = await Comment.findByIdAndDelete(commentId)
        if(!deleteComment){
            throw new ApiError(400, "Error while deleting comment from the video")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, deleteComment, "Comment deleted successfully from the video")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }