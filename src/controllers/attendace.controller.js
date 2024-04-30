import Attendance from "../models/attendance.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Teacher } from "../models/teacher.model.js";
import { Level, Section } from "../models/level.model.js";
import Excel from "exceljs";

const createAttendanceRecord = asyncHandler(async (req, res) => {
  const { teacher, level, section, checkInTime, checkOutTime } = req.body;

  const foundTeacher = await Teacher.findOne({ teacherName: teacher });
  if (!foundTeacher) {
    throw new ApiError(404, "Teacher not found");
  }

  const foundLevel = await Level.findOne({ level });
  if (!foundLevel) {
    throw new ApiError(404, "Level not found");
  }

  const foundSection = await Section.findOne({
    sectionName: section,
    _id: { $in: foundLevel.sections },
  });
  if (!foundSection) {
    throw new ApiError(404, "Section not found for the specified level");
  }

  const attendanceRecord = await Attendance.create({
    teacher: foundTeacher._id,
    level: foundLevel._id,
    section: foundSection._id,
    checkInTime,
    checkOutTime,
  });

  return res.json(
    new ApiResponse(
      200,
      attendanceRecord,
      "Attendance record created successfully"
    )
  );
});

const getAllAttendanceRecords = asyncHandler(async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate("teacher", "teacherName")
      .populate("level", "level")
      .populate("section", "sectionName");

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.json(new ApiResponse(200, [], "No attendance records found"));
    }

    // Check if any populated fields might be null and handle accordingly
    const formattedRecords = attendanceRecords.map((record) => {
      const teacherName = record.teacher
        ? record.teacher.teacherName
        : "Unknown Teacher";
      const level = record.level ? record.level.level : "Unknown Level";
      const sectionName = record.section
        ? record.section.sectionName
        : "Unknown Section";

      return {
        teacher: teacherName,
        level,
        section: sectionName,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
      };
    });

    console.log("Formatted Records:", formattedRecords);

    return res.json(
      new ApiResponse(
        200,
        formattedRecords,
        "All attendance records fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return res.json(
      new ApiResponse(500, [], "Error fetching attendance records")
    );
  }
});

const getAllAttendanceRecordsInExcel = asyncHandler(async (req, res) => {
  const attendanceRecords = await Attendance.find()
    .populate("teacher", "teacherName")
    .populate("level", "level")
    .populate("section", "sectionName");

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("Attendance Records");

  worksheet.columns = [
    { header: "Teacher", key: "teacherName", width: 20 },
    { header: "Level", key: "level", width: 20 },
    { header: "Section", key: "sectionName", width: 20 },
    { header: "Check In Time", key: "checkInTime", width: 20 },
    { header: "Check Out Time", key: "checkOutTime", width: 20 },
  ];

  attendanceRecords.forEach((record) => {
    worksheet.addRow({
      teacherName: record.teacher.teacherName,
      level: record.level.level,
      sectionName: record.section.sectionName,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=attendance_records.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
});

const updateAttendanceRecord = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;
  const { checkInTime, checkOutTime } = req.body;

  const updatedRecord = await Attendance.findByIdAndUpdate(
    attendanceId,
    { checkInTime, checkOutTime },
    { new: true }
  );

  if (!updatedRecord) {
    throw new ApiError(404, "Attendance record not found");
  }

  return res.json(
    new ApiResponse(
      200,
      updatedRecord,
      "Attendance record updated successfully"
    )
  );
});

const deleteAttendanceRecord = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;

  const record = await Attendance.findById(attendanceId);

  if (!record) {
    throw new ApiError(404, "Attendance record not found");
  }

  await record.deleteOne();

  return res.json(
    new ApiResponse(200, null, "Attendance record deleted successfully")
  );
});

export {
  createAttendanceRecord,
  getAllAttendanceRecords,
  getAllAttendanceRecordsInExcel,
  updateAttendanceRecord,
  deleteAttendanceRecord,
};
