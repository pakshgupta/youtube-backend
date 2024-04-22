import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { vidoeId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(vidoeId)) {
    throw new ApiError(400, "videoId is not valid");
  }
  if (!content) {
    throw new ApiError(400, "content not available");
  }
  const uploadComment = await Comment.create({
    content,
    video: vidoeId,
    owner: req.user?._id,
  });
  if (!uploadComment) {
    throw new ApiError(400, "Fai;ed to upload comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, uploadComment, "Comment upload successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "commentId is not valid");
  }
  if (!content) {
    throw new ApiError(400, "content not available");
  }
  const comment = await Comment.findById(commentId);
  if (comment?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only owner can edit coment");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(400, "Failed to update comment");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateComment,
        "Comment has been updated successfully"
      )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "commentId is not valid");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment is required");
  }
  if (comment?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only owner can edit coment");
  }
  const deleteComment = await Comment.findByIdAndDelete(commentId);
  if (!deleteComment) {
    throw new ApiError(400, "Failed to update comment");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateComment,
        "Comment has been deleted successfully"
      )
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
