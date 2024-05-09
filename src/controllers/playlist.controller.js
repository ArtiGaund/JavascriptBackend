import mongoose, {Mongoose, isValidObjectId} from "mongoose"
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
            throw new ApiError(400, "Name and description are required")
        }
        const playlist = await Playlist.create({
            name,
            description: description || "",
            owner: req.user?._id,
            video: []
        })
        if(!playlist){
            throw new ApiError(400, "Error while creating playlist.")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist created successfully")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    try {
        if(!userId){
            throw new ApiError(400, "User id is required")
        }
        const userExist = await User.findById(userId)
        if(!userExist){
            throw new ApiError(400, "User does not exist")
        }
        const userAllPlaylists = await Playlist.aggregate([
            {
                $match:{
                    owner: new Mongoose.Types.ObjectId(userId)
                }
            },
            {
                $project:{
                    name: 1,
                    description: 1,
                    owner: 1,
                    videos:{
                        $cond:{
                            if:["$owner", new mongoose.Types.ObjectId(req.user?._id)],
                            then: "$videos",
                            else:{
                                $filter:{
                                    input:"$videos",
                                    as: "videoArray",
                                    cond: {
                                        $gt: ['$videoArray.isPublished',true]
                                    }
                                }
                            }
                        }
                    },
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ])
        if(!userAllPlaylists){
            throw new ApiError(400, "User does not have any playlist")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, userAllPlaylists, "User all playlist fetched successfully.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
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
            throw new ApiError(400, "Playlist does not exist of given id")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist fetched successfully.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    try {
        if(!playlistId){
            throw new ApiError(400, "Playlist id is required")
        }
        if(!videoId){
            throw new ApiError(400, "Video id is required")
        }
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(400, "Playlist does not exist of given id")
        }
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(400, "Video does not exist of given id")
        }
        const videoPresent = await playlist.videos.find(video => video._id == videoId)
        if(videoPresent){
            throw new ApiError(400, "Video already present in playlist")
        }
        const addVideo = await playlist.videos.push(video)
        if(!addVideo){
            throw new ApiError(400, "Error while adding video in the playlist")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, addVideo, "Video have been added to the playlist successfully.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
   try {
        if(!playlistId){
            throw new ApiError(400, "Playlist id is required.")
        }
        if(!videoId){
            throw new ApiError(400, "Video id is required.")
        }
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(400, "Playlist does not exist of the given id")
        }
        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(400, "Video does not exist of given id")
        }
        const findVideoInPlaylist = await playlist.videos.find(video => video._id == videoId)
        if(!findVideoInPlaylist){
            throw new ApiError(400, "Video not present in playlist")
        }
        const removeVideo = await playlist.remove(video)
        if(!removeVideo){
            throw new ApiError(400, "Error while removing video from playlist")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, removeVideo, "Video have been removed from the playlist successfully.")
        )
   } catch (error) {
        throw new ApiError(404, error?.message)
   }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    try {
        if(!playlistId){
            throw new ApiError(400, "Playlist id is required")
        }
        const removePlaylist = await Playlist.findByIdAndDelete({_id:playlistId})
        if(!removePlaylist){
            const findPlaylist = await Playlist.findById(playlistId)
            if(!findPlaylist){
                throw new ApiError(400, "Playlist does not exist")
            }
            throw new ApiError(400, "Error while deleting playlist")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, removePlaylist, "Playlist deleted successfully.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    try {
        if(!playlistId){
            throw new ApiError(400, "Playlist id is required")
        }
        if(!name || !description){
            throw new ApiError(400, "Name and description are required")
        }
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(400, "Playlist does not exist")
        }
        if(playlist.name === name || playlist.description === description){
            throw new ApiError(400, "Name or description is same as before")
        }
        const updateplaylist = await Playlist.findByIdAndUpdate(
            { _id: playlistId},
            {
                $set:{
                    name,
                    description
                }
            },
            {new: true}
        )
        if(!updateplaylist){
            throw new ApiError(400, "Error while updating playlist.")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, updateplaylist, "Playlist updated successfully.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
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