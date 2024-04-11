import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // To make field serchable in optimized way, make its index true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudnary url use in this
      required: true,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/*Always use funciton instead of arrow function
because arrow funciton do not have thsi and in middleware like pre
we need thsi keyword to get the reference of current context
make function async because it take some time 
*/

// We created this because we want when we save our password
// Just before save we want to enctypt it
// So to achieve this we need middleware.
// So we use pre middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password"))
    // check because we want to modify password only when password is created or modified. If any other field modifed do not change it
    return next();
  this.password = bcrypt(this.password, 10);
});

// Now the password is saved in  encrypted form in database
// But the do not enter encrypted password
// So to match the user password we need to create a method
// mongodb also provide to create own custom methods

// create custom method using methods and name it isPasswordCorrec
// Since it is time consuming so use async await
// bcrypt also provide compare method to compare it give true or false
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


// create custom method using methods and name it generateAccessToken
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
};

// create custom method using methods and name it generateRefreshToken
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
          _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
      )
};
export const User = mongoose.model("User", userSchema);
