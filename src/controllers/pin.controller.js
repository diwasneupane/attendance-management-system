import Pin from "../models/pin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";

// Validate a PIN
export const validatePin = asyncHandler(async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json(new ApiResponse(400, "PIN is required"));
    }

    const foundPin = await Pin.findOne({ pin });

    if (!foundPin) {
      return res.status(404).json(new ApiResponse(404, "Invalid PIN"));
    }

    return res.status(200).json(new ApiResponse(200, "PIN is valid"));
  } catch (error) {
    console.error("Error during PIN validation:", error);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

// Add a new PIN
export const addPin = asyncHandler(async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      throw new ApiError(400, "PIN is required");
    }

    if (pin.length > 4) {
      throw new ApiError(400, "PIN must not exceed four characters");
    }

    const newPin = new Pin({ pin });
    await newPin.save();

    return res.status(201).json(new ApiResponse(201, "PIN added successfully"));
  } catch (error) {
    console.error("Error adding PIN:", error);
    throw new ApiError(500, "Failed to add PIN");
  }
});

// Update an existing PIN
export const updatePin = asyncHandler(async (req, res) => {
  try {
    const { pinId } = req.params; // Retrieve the pinId from the route parameters
    const { newPin } = req.body; // Retrieve the new PIN from the request body

    if (!isValidObjectId(pinId)) {
      // Validate if pinId is a valid ObjectId
      throw new ApiError(400, "Invalid PIN ID");
    }

    if (!newPin) {
      return res.status(400).json(new ApiResponse(400, "New PIN is required"));
    }

    if (newPin.length > 4) {
      // Ensure the new PIN does not exceed four characters
      return res
        .status(400)
        .json(new ApiResponse(400, "New PIN must not exceed four characters"));
    }

    const updatedPin = await Pin.findByIdAndUpdate(
      pinId,
      { pin: newPin },
      { new: true }
    );

    if (!updatedPin) {
      // Check if a PIN was found and updated
      throw new ApiError(404, "PIN not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "PIN updated successfully"));
  } catch (error) {
    console.error("Error updating PIN:", error);
    throw new ApiError(500, "Failed to update PIN");
  }
});

export const deletePin = asyncHandler(async (req, res) => {
  try {
    const { pinId } = req.params;

    const pin = await Pin.findById(pinId);

    if (!pin) {
      throw new ApiError(404, "PIN not found");
    }

    await pin.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, "PIN deleted successfully"));
  } catch (error) {
    console.error("Error deleting PIN:", error);
    throw new ApiError(500, "Failed to delete PIN");
  }
});

// View all PINs
export const viewPins = asyncHandler(async (req, res) => {
  try {
    const pins = await Pin.find();

    if (pins.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No PINs found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, pins, "PINs retrieved successfully"));
  } catch (error) {
    console.error("Error viewing PINs:", error);
    return res.status(500).json(new ApiResponse(500, "Failed to view PINs"));
  }
});
