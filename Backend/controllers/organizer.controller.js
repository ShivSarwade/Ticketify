import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Organizer from "../models/organizer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const Test = asyncHandler(async (req, res) => {
  res.status(200).json({
    message:
      "this is for organizer routes testing if you not developer why you where ",
    name: req.body,
  });
});

const generateAccessAndRefreshToken = async (organizerId) => {
  try {
    const organizer = await Organizer.findById(organizerId);
    const accessToken = organizer.generateAccessToken();
    const refreshToken = organizer.generateRefreshToken();

    organizer.refreshToken = refreshToken;
    await organizer.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerOrganizer = asyncHandler(async (req, res) => {
  const { email, fullName, username, password,phoneNo } = req.body;
  console.log(req.body);

  if (
    [email, fullName, username, password,phoneNo].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingOrganizer = await Organizer.findOne({ email });

  if (existingOrganizer) {
    throw new ApiError(409, "Organizer with email already exists");
  }

  const organizer = await Organizer.create({
    username,
    email,
    fullName,
    password,
    phoneNo
  });

  const createdOrganizer = await Organizer.findById(organizer._id).select(
    "-password -refreshToken"
  );

  if (!createdOrganizer) {
    throw new ApiError(500, "Error in registering the organizer");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdOrganizer, "Organizer registered successfully"));
});

const loginOrganizer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email || password)) {
    throw new ApiError(400, "email and password are required");
  }

  const organizer = await Organizer.findOne({ email });

  if (!organizer) {
    throw new ApiError(404, "Organizer does not exist");
  }

  const isPasswordValid = await organizer.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid organizer details");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    organizer._id
  );

  const loggedInOrganizer = await Organizer.findById(organizer._id).select(
    "-password -refreshToken"
  );

  // const options = {
  //   httpOnly: true,
  //   secure: true,
  // };
  res.setHeader("Authorization", `Bearer ${accessToken}`);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          organiser: loggedInOrganizer,
          accessToken,
          refreshToken,
        },
        "Organizer LoggedIn successfully"
      )
    );
});

const logoutOrganizer = asyncHandler(async (req, res) => {
  //takes headers from frontend
  await Organizer.findByIdAndUpdate(
    req.organizer._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Organizer Logged out "));
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
      const organizer = await Organizer.findById(decodedToken._id);

      if (!organizer) {
        throw new ApiError(401, "Invalid refresh token");
      }
      if (incomingRefreshToken !== organizer.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
      }

      const { accessToken, newRefreshToken } =
        await generateAccessAndRefreshToken(organizer._id);

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

  let organizer_id;
  if (req.organizer) {
    organizer_id = req.organizer._id;
  }

  const organizer = await Organizer.findById(organizer_id);
  const isPasswordCorrect = await organizer.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  organizer.password = newPassword;
  await organizer.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentOrganizer = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.organizer, "Current organizer fetched"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const updatedData = req.body;

  if (updatedData.password) {
    delete updatedData.password;
  }
  
  if (!req.organizer?._id) {
    throw new ApiError(400, "Organizer ID not provided.");
  }
  
  const organizer_id = req.organizer._id;
  
  // Step 1: Check for duplicate username, email, or phoneNo only if they're being updated
  if (updatedData.username && updatedData.username !== req.organizer.username) {
    console.log("Checking if username exists:", updatedData.username);
    const existingUsername = await Organizer.findOne({ username: updatedData.username });
    if (existingUsername && existingUsername._id !== organizer_id) {
      console.log("Duplicate username found:", existingUsername);
      throw new ApiError(400, "Username already exists.");
    }
  }
  
  if (updatedData.email && updatedData.email !== req.organizer.email) {
    console.log("Checking if email exists:", updatedData.email);
    const existingEmail = await Organizer.findOne({ email: updatedData.email });
    if (existingEmail && existingEmail._id !== organizer_id) {
      console.log("Duplicate email found:", existingEmail);
      throw new ApiError(400, "Email already exists.");
    }
  }
  
  if (updatedData.phoneNo && updatedData.phoneNo !== req.organizer.phoneNo) {
    console.log("Checking if phoneNo exists:", updatedData.phoneNo);
    const existingPhoneNo = await Organizer.findOne({ phoneNo: updatedData.phoneNo });
    if (existingPhoneNo && existingPhoneNo._id !== organizer_id) {
      console.log("Duplicate phone number found:", existingPhoneNo);
      throw new ApiError(400, "Phone number already exists.");
    }
  }
  
  // Step 2: Prepare the updated data (excluding username, email, and phoneNo)
  console.log("Final Updated Data to be applied:", updatedData);
  
  // Step 3: Update the organizer in the database
  const organizer = await Organizer.findByIdAndUpdate(
    organizer_id,
    { $set: updatedData },
    { new: true } // Return the updated document
  ).select("-password -refreshToken"); // Exclude sensitive fields
  
  if (!organizer) {
    throw new ApiError(404, "Organizer not found.");
  }
  
  // Step 4: Return the updated organizer data
  return res
    .status(200)
    .json(new ApiResponse(200, organizer, "Organizer info updated successfully."));  
});

const updateOrganizerOverview = asyncHandler(async (req, res) => {
  const { about } = req.body;

  try {
    const organizer = await Organizer.findOneAndUpdate(
      req.organizer._id,
      {
        $set: {
          about,
        },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");

    if (!organizer) {
      throw new ApiError(404, "organizer not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, organizer, "organizer overview updated successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "error while updating organizer overview"
    );
  }
});

const updateOrganizerAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "File not found");
  }
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is missing");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar)
  if (!avatar.url) {
    throw new ApiError(400, "Error while updating avatar");
  }
  const deletePreviousFile = await Organizer.findById(req.organizer._id);
  console.log(deletePreviousFile);

  if (deletePreviousFile.avatar) {
    const fileurl = deletePreviousFile.avatar.split("/").pop().split(".")[0];
    console.log(fileurl)
    const deletedfile = await deleteFromCloudinary(fileurl);
  }
  const updatedOrganizer = await Organizer.findByIdAndUpdate(
    req.organizer._id, //change back to req.organizer._id
    {
      $set: {
        avatar: avatar.url,
      },
    }
  ).select("-password -refreshToken");
  console.log(updatedOrganizer.avatar)
  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrganizer, "avatar uploded successfully"));
});

export {
  Test,
  registerOrganizer,
  loginOrganizer,
  logoutOrganizer,
  refreshAccessToken,
  changePassword,
  getCurrentOrganizer,
  updateOrganizerOverview,
  updateAccountDetails,
  updateOrganizerAvatar,

};
