import Attendance from "../models/attendance.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Teacher } from "../models/teacher.model.js";
import { Level, Section } from "../models/level.model.js";

const createAttendanceRecord = asyncHandler(async (req, res) => {
  // Extract data from the request body
  const { teacher, level, section, checkInTime, checkOutTime } = req.body;

  try {
    // Find the teacher by name
    const foundTeacher = await Teacher.findOne({ teacherName: teacher });
    if (!foundTeacher) {
      throw new ApiError(404, "Teacher not found");
    }

    // Find the level by name
    const foundLevel = await Level.findOne({ level });
    if (!foundLevel) {
      throw new ApiError(404, "Level not found");
    }

    // Find the section by name and ensure it belongs to the specified level
    const foundSection = await Section.findOne({
      sectionName: section,
      _id: { $in: foundLevel.sections },
    });
    if (!foundSection) {
      throw new ApiError(404, "Section not found for the specified level");
    }

    // Create a new attendance record
    const attendanceRecord = await Attendance.create({
      teacher: foundTeacher._id.toString(), // Convert ObjectId to string
      level: foundLevel._id.toString(), // Convert ObjectId to string
      section: foundSection._id.toString(), // Convert ObjectId to string
      checkInTime,
      checkOutTime,
    });

    // Respond with the created attendance record
    return res.json(
      new ApiResponse(
        200,
        attendanceRecord,
        "Attendance record created successfully"
      )
    );
  } catch (error) {
    console.error("Error creating attendance record:", error);
    throw new ApiError(
      500,
      "Failed to create attendance record: " + error.message
    );
  }
});

const getAllAttendanceRecords = asyncHandler(async (req, res) => {
  try {
    // Fetch all attendance records from the database
    const attendanceRecords = await Attendance.find()
      .populate({
        path: "teacher",
        select: "teacherName -_id", // Select only teacherName and exclude _id
      })
      .populate({
        path: "level",
        select: "level -_id", // Select only level and exclude _id
      })
      .populate({
        path: "section",
        select: "sectionName -_id", // Select only sectionName and exclude _id
      })
      .select("checkInTime checkOutTime"); // Select checkInTime and checkOutTime

    // Map fetched attendance records to extract required fields
    const formattedRecords = attendanceRecords.map((record) => ({
      teacher: record.teacher.teacherName,
      level: record.level.level,
      section: record.section.sectionName,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
    }));

    // Respond with the formatted attendance records
    return res.json(
      new ApiResponse(
        200,
        formattedRecords,
        "All attendance records fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw new ApiError(
      500,
      "Failed to fetch attendance records: " + error.message
    );
  }
});
export { createAttendanceRecord, getAllAttendanceRecords };
