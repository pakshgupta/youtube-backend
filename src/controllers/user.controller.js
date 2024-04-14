import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudnary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {

/* **************************STEPS************************************** */
  // Get user data form frontend
  // validation- not empty
  // check if user already exist:username,email:-navitage to login
  // check for images, check for avatar
  // upload them to cloudinary,avtar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response
  /* ************************STEPS************************************** */

  // Get user data form frontend
  const { fullName, email, username, password } = req.body;
  // req.body does not give files 
  // console.log(req.body); 

  // validation- not empty
  if (
    [fullName, email, username, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exist:username,email:-navitage to login
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) throw new ApiError(409, "User already existed");

  // check for images, check for avatar
  const avtarLocalPath = req.files?.avatar[0]?.path;
  // This will give error if path is undefined
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath=req.files.coverImage[0].path
  }
  if (!avtarLocalPath) throw new ApiError(400, "Avtar file is required");

  // upload them to cloudinary,avtar
  const avatar = await uploadOnCloudnary(avtarLocalPath); // This is the reason we make registerUser async
  const coverImage = await uploadOnCloudnary(coverImageLocalPath);
  if (!avatar) throw new ApiError(404, "Avtar not found");

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // Check for cover Image because cover image is not required field
    email,
    password,
    username: username.toLowerCase(),
  });
  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // generally in select method we select those fields which we want to remove from response
  );

  // check for user creation
  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering the user");

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
