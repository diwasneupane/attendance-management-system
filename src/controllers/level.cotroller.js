import { Level, Section } from "../models/level.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Controller function to create a new level with sections
const createLevel = asyncHandler(async (req, res) => {
  const { level, sections } = req.body;

  // Check if required fields are provided
  if (!level || !sections || sections.length === 0) {
    throw new ApiError(409, "Level name and at least one section are required");
  }

  // Check if the level already exists
  const existingLevel = await Level.findOne({ level });
  if (existingLevel) {
    throw new ApiError(400, "Level already exists");
  }

  // Array to store section ObjectIds
  const sectionIds = [];

  // Create sections if they don't exist, and get their ObjectIds
  for (const sectionName of sections) {
    let section = await Section.findOne({ sectionName });

    // If section doesn't exist, create it
    if (!section) {
      section = await Section.create({ sectionName });
    }

    // Store section ObjectId in array
    sectionIds.push(section._id);
  }

  // Create the level with the provided sections' ObjectIds
  const newLevel = await Level.create({ level, sections: sectionIds });

  // Fetch the newly created level with populated sections
  const createdLevel = await Level.findById(newLevel._id).populate("sections");

  // Respond with the created level
  return res.json(
    new ApiResponse({
      level: createdLevel,
      message: "Level created successfully",
    })
  );
});

const addAdditionalSections = asyncHandler(async (req, res) => {
  const { levelId, additionalSections } = req.body;

  // Check if required fields are provided
  if (!levelId || !additionalSections || additionalSections.length === 0) {
    throw new ApiError(
      409,
      "Level ID and at least one additional section are required"
    );
  }

  // Find the level
  const existingLevel = await Level.findById(levelId);
  if (!existingLevel) {
    throw new ApiError(404, "Level not found");
  }

  // Add additional sections to the existing level
  const sectionIds = [];
  for (const sectionName of additionalSections) {
    // Check if the section already exists
    let section = await Section.findOne({ sectionName });

    // If the section doesn't exist, create it
    if (!section) {
      section = await Section.create({ sectionName });
    }

    // Store section ObjectId in array
    sectionIds.push(section._id);

    // Check if the section already exists in the level
    const sectionExistsInLevel = existingLevel.sections.some(
      (sectionId) => sectionId.toString() === section._id.toString()
    );
    if (sectionExistsInLevel) {
      throw new ApiError(400, "Section already exists in the level");
    }
  }

  // Add the section ObjectIds to the level
  existingLevel.sections.push(...sectionIds);
  await existingLevel.save();

  // Respond with the updated level
  const updatedLevel = await Level.findById(levelId).populate("sections");
  return res.json(
    new ApiResponse(200, updatedLevel, "Added section successfully")
  );
});

const deleteLevel = asyncHandler(async (req, res) => {
  const { levelId } = req.params;

  // Check if the level exists
  const level = await Level.findById(levelId);
  if (!level) {
    throw new ApiError(404, "Level not found");
  }

  // Delete the level
  await level.deleteOne();

  // Respond with success message
  return res.json(new ApiResponse(200, null, "Level deleted successfully"));
});

const updateLevelDetails = asyncHandler(async (req, res) => {
  const { level } = req.body;
  const { levelId } = req.params;

  // Log the received data for debugging
  console.log("Received level data:", level);
  console.log("Received levelId:", levelId);

  if (!level) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const updatedLevel = await Level.findByIdAndUpdate(
      levelId,
      { $set: { level } },
      { new: true }
    );

    // Log the updated level for debugging
    console.log("Updated level:", updatedLevel);

    if (!updatedLevel) {
      throw new ApiError(404, "Level not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedLevel, "Level details updated successfully")
      );
  } catch (error) {
    // Log any errors for debugging
    console.error("Error updating level:", error);
    throw new ApiError(500, "Failed to update level details");
  }
});

// Controller function to update section details
const updateSectionDetails = asyncHandler(async (req, res) => {
  const { sectionName } = req.body;
  const { sectionId } = req.params;

  try {
    if (!sectionName) {
      throw new ApiError(400, "sectionName field is required");
    }

    // Check if the sectionId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      throw new ApiError(400, "Invalid sectionId");
    }

    // Find the section by ID and update its name
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $set: { sectionName } },
      { new: true }
    );

    // Ensure that the section is found and updated
    if (!updatedSection) {
      console.log("Section not found:", sectionId);
      throw new ApiError(404, "Section not found");
    }

    // Find all levels containing the updated section
    const levelsToUpdate = await Level.find({ sections: sectionId });

    // Update each level to reflect the updated section name
    await Promise.all(
      levelsToUpdate.map(async (level) => {
        // Update the section name in the level's sections array
        level.sections.forEach((section, index) => {
          if (section.toString() === sectionId) {
            level.sections[index] = updatedSection._id;
          }
        });
        // Save the updated level
        await level.save();
        console.log("Level updated:", level._id);
      })
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedSection, "updated successfully"));
  } catch (error) {
    console.error("Error updating section details:", error.message);
    throw new ApiError(500, "Failed to update section details");
  }
});

// Function to handle section deletion

// Controller function to delete a section
const deleteSection = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;

  // Check if the section exists
  const section = await Section.findById(sectionId);
  if (!section) {
    throw new ApiError(404, "Section not found");
  }

  // Delete the section
  await section.deleteOne();

  // Handle deletion from associated levels
  await handleSectionDeletion(sectionId);

  // Respond with success message
  return res.json(new ApiResponse(200, "Section deleted successfully"));
});

const handleSectionDeletion = asyncHandler(async (sectionId) => {
  // Find all levels containing the deleted section
  const levelsToUpdate = await Level.find({ sections: sectionId });

  // Update each level to remove the deleted section
  await Promise.all(
    levelsToUpdate.map(async (level) => {
      level.sections = level.sections.filter(
        (section) => section.toString() !== sectionId
      );
      await level.save();
    })
  );
});

const getLevel = asyncHandler(async (req, res) => {
  try {
    // Aggregate pipeline to join levels with sections and project only the section names
    const levels = await Level.aggregate([
      {
        $lookup: {
          from: "sections", // Collection name
          localField: "sections",
          foreignField: "_id",
          as: "sectionDetails",
        },
      },
      {
        $unwind: "$sectionDetails",
      },
      {
        $group: {
          _id: "$_id",
          level: { $first: "$level" },
          sectionNames: { $push: "$sectionDetails.sectionName" },
        },
      },
    ]);

    // Check if any levels are found
    if (!levels || levels.length === 0) {
      throw new ApiError(404, "No levels found");
    }

    // Respond with the fetched levels
    return res.json(
      new ApiResponse(200, levels, "Levels fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to fetch levels");
  }
});
// const getLevel = asyncHandler(async (req, res) => {
//   try {
//     // Aggregate pipeline to join levels with sections and project only the section names
//     const levels = await Level.find();

//     // Check if any levels are found
//     if (!levels || levels.length === 0) {
//       throw new ApiError(404, "No levels found");
//     }

//     // Respond with the fetched levels
//     return res.json(
//       new ApiResponse(200, levels, "Levels fetched successfully")
//     );
//   } catch (error) {
//     throw new ApiError(500, "Failed to fetch levels");
//   }
// });

export {
  createLevel,
  deleteLevel,
  addAdditionalSections,
  handleSectionDeletion,
  deleteSection,
  updateLevelDetails,
  updateSectionDetails,
  getLevel,
};
