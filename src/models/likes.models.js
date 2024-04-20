import mongoose from "mongoose";
const likesSchema = new mongoose.Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comments",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweets",
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  },
  { timestamps: true }
);
