import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    try {
        if(!name || !description){
            throw new ApiError(400, "For creating playlist name and description is required")
        }
        const playlist = await Playlist.create({
            name: name,
            description: description  || "",
            video: [],
            owner: req.user?._id,
        })
        if(!playlist){
            throw new ApiError(400, "Error while creating playlist")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "New Playlist created successfully.")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
   try {
        if(!userId){
            throw new ApiError(400, "User id is required")
        }
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(400, "User does not exist in database")
        }
        const usersAllPlaylist = await Playlist.aggregate([
            {
                $match:{
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $project:{
                    name: 1,
                    description: 1,
                    owner: 1,
                    videos: {
                        $cond: {
                            if: ["$owner", new mongoose.Types.ObjectId(req.user?._id)],
                            then: "$videos",
                            else:{
                                $filter:{
                                    input: "$videos",
                                    as: "videosArray",
                                    cond: { $gt: ['$videosArray.isPublished', true]}
                                }
                            }
                        }
                    },
                    createdAt: 1,
                    updatedAt: 1,
                }
            }
        ])
        if(!usersAllPlaylist){
            throw new ApiError(400, "There is an error while fetching user all playlist")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, usersAllPlaylist[0],"User all playlist fetched successfully.")
        )
   } catch (error) {
    throw new ApiError(401, error?.message)
   }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    try {
        if(!playlistId){
            throw new ApiError(400, "Playlist id is required")
        }
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(400, "Playlist does not exist in database")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist fetched successfully.")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    try {
        if(!playlistId || !videoId ){
            throw new ApiError(400, "Playlist id and video id is required")
        }
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(400, "Playlist does not exist in database")
        }
        const video = await Video.findById(videoId)
        if(!video || !(video.owner.toString()===req.user?._id.toString())){
            throw new ApiError(400, "Video does not exist for this videos id")
        }
        const playlistAlreadyHaveVideo = await playlist.videos.inclue(videoId)
        if(playlistAlreadyHaveVideo){
            return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Video is already present in this playlist")
            )
        }
        const addVideoInPlaylist = await playlist.videos.push(video)
        playlist.save()
        return res
        .status(200)
        .json(
            new ApiResponse(200, addVideoInPlaylist, "Video is added to the playlist successfully")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    try {
        if(!playlistId && !videoId){
            throw new ApiError(400, "Playlist id and video id is required")
        }
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(400, "Playlist does not exist in database")
        }
        const video = await Video.findById(videoId)
        if(!video || !(video.owner.toString()===res.user?._id.toString())){
            throw new ApiError(400, "Video does not exist for this videos id")
        }
        const videoExist = await playlist.videos.inclue(videoId)
        if(!videoExist){
            throw new ApiError(400, "Video does not exist in this playlist")
        }
        const deleteVideo = await playlist.videos.remove(video)
        if(!deleteVideo){
            throw new ApiError(400, "Error occur while removing video from playlist")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, deleteVideo , "Video is removed from the playlist successfully")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
   try {
        if(!playlistId){
            throw  new ApiError(400, "Playlist id is required")
        }
       const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)
       if(!deletePlaylist){
        throw new ApiError(400, "Error occur while deleting playlist")
       }
       return res
       .status(200)
       .json(
        new ApiResponse(200, deletePlaylist, "Playlist deleted successfully")
       )

   } catch (error) {
        throw new ApiError(400, error?.message)
   }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    try {
        if(!playlistId){
            throw new ApiError(400, "Playlist id is required")
        }
        if(!name && !description){
            throw new ApiError(400, "Name and description is required")
        }
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(400, "Playlist does not exist in database")
        }
        if(playlist.name === name || playlist.desciption=== description){
            throw new ApiError(400, "Provide unique name and desciption, these already exist.")
        }
        const updatePlaylist = await Playlist.findByIdAndUpdate(
            {
                _id: playlistId,
            },
            {
                $set: {
                    name,
                    description
                }
            }
        )
        if(!updatePlaylist){
            throw new ApiError(400, "Error while updating playlist")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, updatePlaylist, "Playlist updated successfully")
        )
    } catch (error) {
        throw new ApiError(401, error?.message)
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}