import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const alreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked?._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Video unliked successfully")
      );
  }

  const liked = await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (!liked) {
    throw new ApiError(500, "Server error not able to like video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, liked, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }
  const alreadyCommented = await Like.findOne({
    commen: commentId,
    likedBy: req.use?._id,
  });

  if (alreadyCommented) {
    await Like.findByIdAndDelete(alreadyCommented?._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Comment unliked successfully")
      );
  }

  const commentLike = await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (!commentLike) {
    throw new ApiError(500, "Server error not able to dislike");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, commentLike, "Comment unliked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetIdId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  const alreadyLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked?._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Tweet unliked successfully")
      );
  }

  const liked = await Like.create({
    video: tweetId,
    likedBy: req.user?._id,
  });

  if (!liked) {
    throw new ApiError(500, "Server error not able to like tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, liked, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
