import mongoose from "mongoose";
const playlistSchema = new mongoose.Schema(
  {
    name: {
      tyoe: String,
      required: true,
    },
    description: {
      tyoe: String,
      required: true,
    },
    videos: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export const Playlist = mongoose.model("Playlist", playlistSchema);
