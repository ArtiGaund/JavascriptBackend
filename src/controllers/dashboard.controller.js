import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    try {
        const totalView = await Video.aggregate([
            {
                $match:{
                    owner: req.user?._id,
                    isPublished: true,
                }
            },
            {
                $group: { _id: null, totalView: { $num: "$views"} },
            },
            {
                $project: {
                    _id: 1,
                    totalView: 1,
                }
            }
        ])
        if(!totalView){
            throw new ApiError(400, "Error while fetching total views for channel stats")
        }
        const totalSubscribers = await Subscription.aggregate([
            {
                $match:{
                    channel: req.user?._id,
                }
            },
            {
                $group: {
                    _id: null,
                    totalSub: { $num: 1},
                }
            },
            {
                $project:{
                    totalSub: 1,
                }
            }
        ])
        if(!totalSubscribers){
            throw new ApiError(400, "Error while fetching total subscriber for the channel stats")
        }
        const totalVideos = await Video.aggregate([
            {
                $match:{
                    owner: req.user?._id,
                    isPublished: true,
                }
            },
            {
                $group:{
                    _id: null,
                    totalVideo: { $sum: 1}
                }
            },
            {
                $project: {
                    totalVideo: 1,
                }
            }
        ])
        if(!totalVideos){
            throw new ApiError(400, "Error while fetching total videos for the channel stats")
        }
        const totalLikes = await Video.aggregate([
            {
                $match:{
                    owner: req.user?._id,
                    isPublished: true,
                }
            },
            {
                $lookup: {
                    from: "Likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "videoLikes"
                }
            },
            {
                $unwind: "videoLikes"
            },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: 1}
                }
            },
            {
                $project: {
                    likes: 1,
                }
            }
        ])
        if(!totalLikes){
            throw new ApiError(400, "Error while fetching total likes for the videos of the channel")
        }
        const totalTweets = await Tweet.aggregate([
            {
                $match:{
                    owner: req.user?._id,
                }
            },
            {
                $group:{
                    _id: null,
                    tweets: { $sum: 1}
                }
            },
            {
                $project:{
                    tweets: 1
                }
            }
        ])
        if(!totalTweets){
            throw new ApiError(400, "Error while fetching total tweets for the videos off the channel")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalLikes,
                    totalSubscribers,
                    totalView,
                    totalVideos,
                    totalTweets
                },
                "Channel stats fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        const videoList = await Video.aggregate([
            {
                $match:{
                    owner: req.user?._id,
                    isPublished: true,
                }
            },
            {
                $project:1
            }
        ])
        if(!videoList || videoList.length()==0){
            throw new ApiError(400, "No Video found for the channel")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, videoList, "All videos of the channel is fetched successfully.")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

export {
    getChannelStats, 
    getChannelVideos
    }