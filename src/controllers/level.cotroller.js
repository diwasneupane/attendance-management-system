const { Level, Section } = require("../models/level.model.js");
const { Teacher } = require("../models/teacher.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { ApiError } = require("../utils/ApiError.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const mongoose = require("mongoose");

const createLevel = asyncHandler(async (req, res) => {
  const { level, sections } = req.body;

  if (!level || !sections || sections.length === 0) {
    throw new ApiError(400, "Level name and at least one section are required");
  }

  const existingLevel = await Level.findOne({ level });
  if (existingLevel) {
    throw new ApiError(409, "Level already exists");
  }

  const sectionIds = [];

  for (const sectionName of sections) {
    const section = await Section.create({ sectionName });
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
      400,
      "Level ID and at least one additional section are required"
    );
  }

  const existingLevel = await Level.findById(levelId).populate("sections");
  if (!existingLevel) {
    throw new ApiError(404, "Level not found");
  }

  const sectionIds = [];
  const existingSectionNames = existingLevel.sections.map(
    (section) => section.sectionName
  );

  for (const sectionName of additionalSections) {
    if (existingSectionNames.includes(sectionName)) {
      throw new ApiError(
        409,
        `Section '${sectionName}' already exists in the level`
      );
    }

    const section = await Section.create({ sectionName });
    sectionIds.push(section._id);
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
  const levels = await Level.find().populate("sections");

  if (!levels || levels.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No levels found."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, levels, "Levels fetched successfully."));
});

const getSystemStats = asyncHandler(async (req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments();

    const levels = await Level.find().populate({
      path: "sections",
      select: "sectionName",
    });

    const levelData = levels.map((level) => ({
      levelName: level.level,
      sectionNames: level.sections.map((section) => section.sectionName),
    }));

    const data = {
      totalTeachers,
      totalLevels: levels.length,
      levelData,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, data, "System stats fetched successfully"));
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, "Failed to fetch system stats"));
  }
});
module.exports = {
  createLevel,
  deleteLevel,
  addAdditionalSections,
  handleSectionDeletion,
  deleteSection,
  updateLevelDetails,
  updateSectionDetails,
  getLevel,
  getSystemStats,
};
