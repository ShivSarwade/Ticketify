import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const Test = asyncHandler(async (req, res) => {
  res.status(200).json({
    message:
      "this is for user routes testing if you not developer why you where ",
    name: req.body,
  });
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, username, password } = req.body;
  console.log(req.body);

  if (
    [email, fullName, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  let existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with email already exists");
  }
  
  existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new ApiError(409, "User with same username already exists");
  }

  const user = await User.create({
    username,
    email,
    fullName,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error in registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email || password)) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user details");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // const options = {
  //   httpOnly: true,
  //   secure: true,
  // };
  res.setHeader("Authorization", `Bearer ${accessToken}`);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "User LoggedIn successfully"
    )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  //takes headers from frontend
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  return res.status(200).json(new ApiResponse(200, {}, "User Logged out "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  {
    const incomingRefreshToken = req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await User.findById(decodedToken._id);

      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      }
      if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
      }

      const { accessToken, newRefreshToken } =
        await generateAccessAndRefreshToken(user._id);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken: newRefreshToken },
            "access token refreshed"
          )
        );
    } catch (error) {
      throw new ApiError(401, error.message || "Invalid RefreshToken");
    }
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  let user_id;
  if (req.user) {
    user_id = req.user._id;
  }

  const user = await User.findById(user_id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log(req.body.accessToken)
  return res
    .status(200)
    .json(new ApiResponse(200, {user:req.user,accessToken:req.body.accessToken}, "Current user fetched"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(400).json({ message: "User ID not provided." });
  }

  const userId = req.user._id;
  const { fullName, address, phoneNo } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { fullName, address, phoneNo } },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found." });
  }

  res.status(200).json({ message: "User info updated successfully.", user: updatedUser });
});



const updateUserOverview = asyncHandler(async (req, res) => {
  const { about } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      req.user._id,
      {
        $set: {
          about,
        },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "user not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, user, "user overview updated successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "error while updating user overview"
    );
  }
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "File not found");
  }
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is missing");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while updating avatar");
  }
  const deletePreviousFile = await User.findById(req.user._id);
  console.log(deletePreviousFile);

  if (deletePreviousFile.avatar) {
    const fileurl = deletePreviousFile.avatar.split("/").pop().split(".")[0];
    const deletedfile = await deleteFromCloudinary(fileurl);
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id, // Change back to req.user._id
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true } // Ensure the updated document is returned
  ).select("-password -refreshToken");
  
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "avatar uploded successfully"));
});

export {
  Test,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserOverview,
  updateAccountDetails,
  updateUserAvatar,
};
