import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import passwordValidation from "../utils/userValidation.js";
import { z } from "zod";

const generateAccessandRefreshTokens = async (_id) => {
  try {
    const admin = await Admin.findById(_id);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save();

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens: " + error.message);
  }
};
const adminRegister = asyncHandler(async (req, res) => {
  try {
    passwordValidation.parse(req.body.password);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => err.message).join("; ");
      throw new ApiError(400, `Admin validation failed: ${errorMessage}`);
    } else {
      throw new ApiError(400, "Admin validation failed");
    }
  }
  const existingAdmin = await Admin.findOne();

  if (existingAdmin) {
    throw new ApiError(400, "Admin already exists");
  }

  const { password } = req.body;
  const admin = await Admin.create({ username: "AdminEliteCa", password });

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Admin registered successfully"));
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    admin._id
  );
  const loggedInAdmin = await Admin.findById(admin?._id).select(
    "-password -refreshToken"
  );
  const options = {
    secure: true,
    httpOnly: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { admin: loggedInAdmin, accessToken, refreshToken },
        "Admin logged in success"
      )
    );
});
const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin loggedOut"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.admin._id);
  const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  admin.password = newPassword;
  await admin.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password change successfully"));
});
const getCurrentAdmin = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.admin, "current admin fetched"));
});

export {
  adminRegister,
  loginAdmin,
  logoutAdmin,
  changeCurrentPassword,
  getCurrentAdmin,
};
