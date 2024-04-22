import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!(name && description)) {
    throw new ApiError(400, "name and description are missing");
  }
  const newPlaylist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });
  if (!newPlaylist) {
    throw new ApiError(500, "Server errro while creating the playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, newPlaylist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user Id");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        totalVideos: 1,
        totalViews: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!playlist) {
    throw new ApiError(500, "Server error while finding the playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "User playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }
  const playlistVideo = Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "vidoes",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $match: {
        "videos.isPublished": true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addField: {
        totalVideos: {
          $size: "$videos",
        },
        $totalViews: {
          $size: "$videos.views",
        },
        totalUsers: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        totalVideos: 1,
        totalViews: 1,
        videos: {
          _id: 1,
          "video.url": 1,
          "thumbnail.url": 1,
          title: 1,
          description: 1,
          createdAt: 1,
          duration: 1,
          views: 1,
        },
        owner: {
          username: 1,
          fullName: 1,
          "avatar.url": 1,
        },
      },
    },
  ]);
  if (!playlistVideo) {
    throw new ApiError(500, "Server error while aggregating playlist videos");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlistVideo, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
    throw new ApiError(400, "Not valid playlist and vido Id's");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(401, "Video is missing");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }
  if (playlist?.owner.toString() !== req.user?._id) {
    throw new ApiError(400, "Only owner can add video to playlist");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        video: videoId,
      },
    },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Server error not able to add video to playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatePlaylist,
        "Video added to playlist succussfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
    throw new ApiError(400, "Not valid playlist and vido Id's");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }
  if (playlist?.owner.toString() !== req.user?._id) {
    throw new ApiError(400, "Only owner can add video to playlist");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        video: videoId,
      },
    },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Server error while updating the playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed successfully from playlist"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Not valid playlistId");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }
  if (playlist?.owner.toString() !== req.user?._id) {
    throw new ApiError(400, "Only owner can delete playlist");
  }
  await Playlist.findByIdAndDelete(playlistId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Not valid playlistId");
  }
  if (!(name && description)) {
    throw new ApiError(400, "name and description are missing");
  }
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only owner can edit the playlist");
  }

  const updatedplaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
        owner: req.user?._id,
      },
    },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Server error while updating the playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
