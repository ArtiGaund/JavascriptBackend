import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
   try {
        if(!channelId){
            throw new ApiError(400, "Channel id is required")
        }
        // check if channel is present or not
        const channel = await User.findById(channelId)
        if(!channel){
            throw new ApiError(400, "Channel does not exist in the database")
        }
        // check if user is already subscribed to the channel
        const alreadySubscribed = await Subscription.findOne({
            subscriber: req.user?._id,
            channel: channelId
        })
        // if subscribed => unsubscribe
        if(alreadySubscribed){
            await Subscription.findByIdAndDelete(
                alreadySubscribed?._id,
                {new: true}
            )
            return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Successfully unsubscribed the channel.")
            )
        }
        const userSubscribe = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })
        if(!userSubscribe){
            throw new ApiError(400, "Error while subscibing the channel" )
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, userSubscribe, "Successfully subscribe to the channel.")
        )
   } catch (error) {
    throw new ApiError(404, error?.message)
   }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    try {
        if(!channelId){
            throw new ApiError(400, "Channel id is required")
        }
        // finding channel exist or not
        const channel = await User.findById(channelId)
        if(!channel){
            throw new ApiError(400, "Channel does not exist in the database")
        }
        const user = await Subscription.aggregate([
            {
                $match: {
                    channel: channel.user?._id
                }
            },
            {
                $project:{
                    channel:1
                }
            }
        ])
        if(!user){
            throw new ApiError(400, "Error while fetching subscribers for the channel")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Subscribers list for the channel fetched successfully")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    try {
        if(!subscriberId){
            throw new ApiError(400, "Subscriber id is required")
        }
        const subscribedUser = await User.findById(subscriberId)
        if(!subscribedUser){
            throw new ApiError(200, "Subscriber does not exist in the database")
        }
        const user = await Subscription.aggregate([
            {
                $match: {
                    subscriber: subscribedUser.user?._id
                }
            },
            {
                $project:{
                    subscriber: 1,
                }
            }
        ])
        if(!user){
            throw new ApiError(400, "Error while fetching subscribers for the channel")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Subscribers list for the channel fetched successfully")
        )
    } catch (error) {
        throw new ApiError(404, error?.message)
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}