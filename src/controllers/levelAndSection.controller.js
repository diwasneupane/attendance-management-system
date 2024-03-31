// import { LevelAndSection } from "../models/levelAndSection.model.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { ApiError } from "../utils/apiError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";

// // Controller function to create a new level with sections
// const createLevel = asyncHandler(async (req, res) => {
//   const { level, sections } = req.body;

//   // Check if required fields are provided
//   if (!level || !sections || sections.length === 0) {
//     throw new ApiError(409, "Level name and at least one section are required");
//   }

//   // Check if the level already exists
//   const existingLevel = await LevelAndSection.findOne({ name: level });
//   if (existingLevel) {
//     throw new ApiError(400, "Level already exists");
//   }

//   // Create the level with the provided sections' names
//   const newLevel = await LevelAndSection.create({ name: level, sections });

//   // Respond with the created level
//   return res.json(
//     new ApiResponse({
//       level: newLevel,
//       message: "Level created successfully",
//     })
//   );
// });

// // Controller function to delete a level
// const deleteLevel = asyncHandler(async (req, res) => {
//   const { levelId } = req.params;

//   // Check if the level exists
//   const level = await LevelAndSection.findById(levelId);
//   if (!level) {
//     throw new ApiError(404, "Level not found");
//   }

//   // Delete the level
//   await level.deleteOne();

//   // Respond with success message
//   return res.json(new ApiResponse(200, null, "Level deleted successfully"));
// });

// // Controller function to add additional sections to an existing level
// const addAdditionalSections = asyncHandler(async (req, res) => {
//   const { levelId, additionalSections } = req.body;

//   // Check if required fields are provided
//   if (!levelId || !additionalSections || additionalSections.length === 0) {
//     throw new ApiError(
//       409,
//       "Level ID and at least one additional section are required"
//     );
//   }

//   // Find the level
//   const existingLevel = await LevelAndSection.findById(levelId);
//   if (!existingLevel) {
//     throw new ApiError(404, "Level not found");
//   }

//   // Add additional sections to the existing level
//   existingLevel.sections.push(...additionalSections);
//   await existingLevel.save();

//   // Respond with the updated level
//   return res.json(
//     new ApiResponse(200, existingLevel, "Added section successfully")
//   );
// });

// // Controller function to update level details
// const updateLevelDetails = asyncHandler(async (req, res) => {
//   const { levelId } = req.params;
//   const { level } = req.body;

//   // Check if required fields are provided
//   if (!level) {
//     throw new ApiError(400, "Level field is required");
//   }

//   // Find the level and update its name
//   const updatedLevel = await LevelAndSection.findByIdAndUpdate(
//     levelId,
//     { name: level },
//     { new: true }
//   );

//   // Respond with the updated level
//   return res.json(
//     new ApiResponse(200, updatedLevel, "Level details updated successfully")
//   );
// });

// // Controller function to update section details
// // const updateSectionDetails = asyncHandler(async (req, res) => {
// //   const { sectionId } = req.params;
// //   const { sectionName } = req.body;

// //   // Check if required fields are provided
// //   if (!sectionName) {
// //     throw new ApiError(400, "Section field is required");
// //   }

// //   // Find the section and update its name
// //   const updatedSection = await LevelAndSection.findByIdAndUpdate(
// //     sectionId,
// //     { $set: { sections: [sectionName] } }, // Assuming only one section is updated at a time
// //     { new: true }
// //   );

// //   // Respond with the updated section
// //   return res.json(
// //     new ApiResponse(200, updatedSection, "Section details updated successfully")
// //   );
// // });

// // Controller function to delete a section
// const deleteSection = asyncHandler(async (req, res) => {
//   const { sectionId } = req.params;

//   // Check if the section exists
//   const section = await LevelAndSection.findById(sectionId);
//   if (!section) {
//     throw new ApiError(404, "Section not found");
//   }

//   // Delete the section
//   await section.deleteOne();

//   // Respond with success message
//   return res.json(new ApiResponse(200, null, "Section deleted successfully"));
// });

// // Controller function to get all levels
// const getLevels = asyncHandler(async (req, res) => {
//   // Fetch all levels from the database
//   const levels = await LevelAndSection.find();

//   // Check if any levels are found
//   if (!levels || levels.length === 0) {
//     throw new ApiError(404, "No levels found");
//   }

//   // Respond with the fetched levels
//   return res.json(new ApiResponse(200, levels, "Levels fetched successfully"));
// });

// export {
//   createLevel,
//   deleteLevel,
//   addAdditionalSections,
//   updateLevelDetails,
//   //   updateSectionDetails,
//   deleteSection,
//   getLevels,
// };
