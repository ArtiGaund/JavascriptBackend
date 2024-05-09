import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
   
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
   try {
        if(!title){
            throw new ApiError(400, "Title is required to publish a video.")
        }
        // fetching thumnnail and video from files
        const videoLocalPath = req.file?.videoFile[0]?.path
        const thumbnailLocalPath = req.file?.thumbnail[0].path
        if(!videoLocalPath){
            throw new ApiError(400, "Video not uploaded")
        }
        if(!thumbnailLocalPath){
            throw new ApiError(400, "Thumbnail not uploaded")
        }
        // uploading video and thumbnail to cloudnary
        const publishThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        const publishVideo = await uploadOnCloudinary(videoLocalPath)
        if(!publishVideo){
            throw new ApiError(400, "Error while uploading video to cloudinary.")
        }
        if(!publishThumbnail){
            throw new ApiError(400, "Error while uploading thumbnail to cloudinary.")
        }
        const newVideo = await Video.create(
            {
                title,
                description: description || "",
                thumbnail: publishThumbnail.url,
                video: publishVideo.url,
                duration: publishVideo.duration,
                owner: req.user?._id
            }
        )
        if(!newVideo){
            throw new ApiError(400, "Error while publishing a video.")
        }
        newVideo.save()
        return res
        .status(200)
        .json(
            new ApiResponse(200, newVideo, "Video published successfully.")
        )
   } catch (error) {
        throw new ApiError(404, error?.message)
   }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   try {
    if(!videoId){
        throw new ApiError(400, "Video id is required")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video does not exist with this id")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video fetched successfully.")
    )
   } catch (error) {
        throw new ApiError(404, error?.message)
   }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   try {
        const { newTitle, newDescription } = req.body
        if(!videoId){
            throw new ApiError(400, "Video id is required to update a video")
        }
        if(!newTitle){
            throw new ApiError(400, "New title is required to update a video")
        }
        const newThumbnail = req.file?.thumbnail[0]?.path
        if(!newThumbnail){
            throw new ApiError(400, "New thumbnail is required to update a video thumbnail")
        }
        const updatedThumbnail = await uploadOnCloudinary(newThumbnail)
        if(!updatedThumbnail){
            throw new ApiError(400, "Error while uploading new thumbnail to cloudinary")
        }
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(400, "Video does not exist with this id")
        }

        const updateVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set:{
                    title: newTitle,
                    description: newDescription || video.description,
                    thumbnail: updatedThumbnail?.url
                }
            },
            { new: true}
        )
        if(!updateVideo){
            throw new ApiError(400, "Error while updating video details")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, updateVideo, "Video updated successfully.")
        )
   } catch (error) {
    throw new ApiError(404, error?.message)
   }

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        if(!videoId){
            throw new ApiError(400, "Video id is required to delete a video")
        }
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(400, "Video does not exist with this id")
        }
        const removeVideo = await Video.findByIdAndDelete(videoId)
        if(!removeVideo){
            throw new ApiError(400, "Error while deleting video")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, removeVideo, "Video deleted successfully.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        if(!videoId){
            throw new ApiError(400, "Video id is required to toggle publish status")
        }
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(400, "Video does not exist with this id")
        }
        video.isPublished = !video.isPublished
        await video.save()
        return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video publish status toggled successfully.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}