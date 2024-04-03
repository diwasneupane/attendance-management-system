import Attendance from "../models/attendance.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Teacher } from "../models/teacher.model.js";
import { Level, Section } from "../models/level.model.js";
import Excel from "exceljs";

const createAttendanceRecord = asyncHandler(async (req, res) => {
  const { teacher, level, section, checkInTime, checkOutTime } = req.body;

  try {
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
      teacher: foundTeacher._id.toString(),
      level: foundLevel._id.toString(),
      section: foundSection._id.toString(),
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
    const attendanceRecords = await Attendance.find()
      .populate({
        path: "teacher",
        select: "teacherName -_id",
      })
      .populate({
        path: "level",
        select: "level -_id",
      })
      .populate({
        path: "section",
        select: "sectionName -_id",
      })
      .select("checkInTime checkOutTime");

    const formattedRecords = attendanceRecords.map((record) => ({
      teacher: record.teacher.teacherName,
      level: record.level.level,
      section: record.section.sectionName,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
    }));

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
const getAllAttendanceRecordsInExcel = asyncHandler(async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate({
        path: "teacher",
        select: "teacherName -_id",
      })
      .populate({
        path: "level",
        select: "level -_id",
      })
      .populate({
        path: "section",
        select: "sectionName -_id",
      })
      .select("checkInTime checkOutTime");

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
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw new ApiError(
      500,
      "Failed to fetch attendance records: " + error.message
    );
  }
});

export {
  createAttendanceRecord,
  getAllAttendanceRecordsInExcel,
  getAllAttendanceRecords,
};
