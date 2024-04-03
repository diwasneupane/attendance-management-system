import { Level, Section } from "../models/level.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createLevel = asyncHandler(async (req, res) => {
  const { level, sections } = req.body;

  if (!level || !sections || sections.length === 0) {
    throw new ApiError(409, "Level name and at least one section are required");
  }

  const existingLevel = await Level.findOne({ level });
  if (existingLevel) {
    throw new ApiError(400, "Level already exists");
  }

  const sectionIds = [];

  for (const sectionName of sections) {
    let section = await Section.findOne({ sectionName });

    if (!section) {
      section = await Section.create({ sectionName });
    }

    sectionIds.push(section._id);
  }

  const newLevel = await Level.create({ level, sections: sectionIds });

  const createdLevel = await Level.findById(newLevel._id).populate("sections");

  return res.json(
    new ApiResponse({
      level: createdLevel,
      message: "Level created successfully",
    })
  );
});

const addAdditionalSections = asyncHandler(async (req, res) => {
  const { levelId, additionalSections } = req.body;

  if (!levelId || !additionalSections || additionalSections.length === 0) {
    throw new ApiError(
      409,
      "Level ID and at least one additional section are required"
    );
  }

  const existingLevel = await Level.findById(levelId);
  if (!existingLevel) {
    throw new ApiError(404, "Level not found");
  }

  const sectionIds = [];
  for (const sectionName of additionalSections) {
    let section = await Section.findOne({ sectionName });

    if (!section) {
      section = await Section.create({ sectionName });
    }

    sectionIds.push(section._id);

    const sectionExistsInLevel = existingLevel.sections.some(
      (sectionId) => sectionId.toString() === section._id.toString()
    );
    if (sectionExistsInLevel) {
      throw new ApiError(400, "Section already exists in the level");
    }
  }

  existingLevel.sections.push(...sectionIds);
  await existingLevel.save();

  const updatedLevel = await Level.findById(levelId).populate("sections");
  return res.json(
    new ApiResponse(200, updatedLevel, "Added section successfully")
  );
});

const deleteLevel = asyncHandler(async (req, res) => {
  const { levelId } = req.params;

  const level = await Level.findById(levelId);
  if (!level) {
    throw new ApiError(404, "Level not found");
  }

  await level.deleteOne();

  return res.json(new ApiResponse(200, null, "Level deleted successfully"));
});

const updateLevelDetails = asyncHandler(async (req, res) => {
  const { level } = req.body;
  const { levelId } = req.params;

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
    console.error("Error updating level:", error);
    throw new ApiError(500, "Failed to update level details");
  }
});

const updateSectionDetails = asyncHandler(async (req, res) => {
  const { sectionName } = req.body;
  const { sectionId } = req.params;

  try {
    if (!sectionName) {
      throw new ApiError(400, "sectionName field is required");
    }

    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      throw new ApiError(400, "Invalid sectionId");
    }

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $set: { sectionName } },
      { new: true }
    );

    if (!updatedSection) {
      console.log("Section not found:", sectionId);
      throw new ApiError(404, "Section not found");
    }

    const levelsToUpdate = await Level.find({ sections: sectionId });

    await Promise.all(
      levelsToUpdate.map(async (level) => {
        level.sections.forEach((section, index) => {
          if (section.toString() === sectionId) {
            level.sections[index] = updatedSection._id;
          }
        });
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

const deleteSection = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;

  const section = await Section.findById(sectionId);
  if (!section) {
    throw new ApiError(404, "Section not found");
  }

  await section.deleteOne();

  await handleSectionDeletion(sectionId);

  return res.json(new ApiResponse(200, "Section deleted successfully"));
});

const handleSectionDeletion = asyncHandler(async (sectionId) => {
  const levelsToUpdate = await Level.find({ sections: sectionId });

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
    const levels = await Level.aggregate([
      {
        $lookup: {
          from: "sections",
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

    if (!levels || levels.length === 0) {
      throw new ApiError(404, "No levels found");
    }

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
