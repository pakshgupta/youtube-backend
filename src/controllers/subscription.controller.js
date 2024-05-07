import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  const isSubscribed = await Subscription.findOne({
    subscribe: req.user?._id,
    channel: channelId,
  });

  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed?._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isSubscribed: false },
          "Unsubscribe successfully"
        )
      );
  }

  const subscribing = await Like.create({
    subscribe: req.user?._id,
    channelId: channelId,
  });

  if (!subscribing) {
    throw new ApiError(500, "Server error not able to subscribe");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscribing, "Subscribe successfully"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }
  const subscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscribe",
        foreignField: "_id",
        as: "subscribe",
        pipeline: [
          {
            $lookup: {
              from: "subscription",
              localField: "_id",
              foreignField: "channel",
              as: "subscribedToSubscriber",
            },
          },
          {
            $addFields: {
              subscribedToSubscriber: {
                $cond: {
                  if: {
                    $in: [channelId, "$subscribedToSubscriber.subscribe"],
                  },
                  then: true,
                  else: false,
                },
              },
              subscribeToCount: {
                $size: "$subscribedToSubscriber",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribe",
    },
    {
      $project: {
        _id: 1,
        subscribe: {
          _id: 1,
          username: 1,
          fullNmae: 1,
          "avatar.url": 1,
          subscribedToSubscriber: 1,
          subscribeToCount: 1,
        },
      },
    },
  ]);
  if (!subscriberList) {
    throw new ApiError(
      500,
      "Internal server error while fetching subscriber list "
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Subscriber fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriberId");
  }
  const subscribedChannelList = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelSubscribed",
        pipeline: [
          {
            // now get the videos of the channel Subscribed
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "$owner",
              as: "videos",
            },
          },
          {
            $addFields: {
              latestVideo: {
                $last: "$vidoes",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$channelSubscribed",
    },
    {
      $project: {
        _id: 0,
        channelSubscribed: {
          _id: 1,
          username: 1,
          fullNmae: 1,
          "avata.url": 1,
          latestVideo: {
            _id: 1,
            "videoFile.url": 1,
            "thumbnail.url": 1,
            owner: 1,
            title: 1,
            description: 1,
            duration: 1,
            createdAt: 1,
            views: 1,
          },
        },
      },
    },
  ]);
  if (!subscribedChannelList) {
    throw new ApiError(
      500,
      "Internal Server error while getting subscribed channel list"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Subscribed channel list fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
