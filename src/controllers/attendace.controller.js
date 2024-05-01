import Attendance from "../models/attendance.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Teacher } from "../models/teacher.model.js";
import { Level, Section } from "../models/level.model.js";
import Excel from "exceljs";
import mongoose from "mongoose";

const createAttendanceRecord = asyncHandler(async (req, res) => {
  const { date, levelId, sectionId, periods } = req.body;

  if (!levelId) {
    throw new ApiError(400, "Level ID is required");
  }

  if (!sectionId) {
    throw new ApiError(400, "Section ID is required");
  }

  if (!Array.isArray(periods) || periods.length === 0) {
    throw new ApiError(400, "At least one period is required");
  }

  const updatedPeriods = periods.map((period) => ({
    ...period,
    level: levelId,
    section: sectionId,
  }));

  const attendanceRecord = await Attendance.create({
    date,
    level: levelId,
    section: sectionId,
    periods: updatedPeriods,
  });

  res.json(
    new ApiResponse(
      200,
      attendanceRecord,
      "Attendance record created successfully"
    )
  );
});

export default createAttendanceRecord;

const getAttendance = asyncHandler(async (req, res) => {
  const { date, level, section } = req.query;

  let query = {};
  if (date) {
    query.date = new Date(date);
  }
  if (level) {
    query.level = level;
  }
  if (section) {
    query.section = section;
  }

  const attendanceRecords = await Attendance.find(query)
    .populate("level", "level")
    .populate("section", "sectionName")
    .populate("periods.teacher", "teacherName")
    .select("-createdAt -updatedAt");

  const formattedRecords = attendanceRecords.flatMap((record) => {
    return record.periods.map((period) => ({
      _id: period._id,
      teacher: period.teacher.teacherName || "Unknown Teacher",
      teacherId: period.teacher._id,
      level: record.level.level || "Unknown Level",
      levelId: record.level._id,
      sectionId: record.section._id,
      section: record.section.sectionName,
      checkInTime: period.checkInTime.toISOString(),
      checkOutTime: period.checkOutTime
        ? period.checkOutTime.toISOString()
        : "",
    }));
  });

  res.json(
    new ApiResponse(
      200,
      formattedRecords,
      "Attendance records fetched successfully"
    )
  );
});

const getAllAttendanceRecordsInExcel = asyncHandler(async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate("periods.teacher", "_id teacherName")
      .populate("level", "_id level")
      .populate("section", "_id sectionName");

    if (!attendanceRecords.length) {
      throw new ApiError(404, "No attendance records found");
    }

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Records");

    worksheet.columns = [
      { header: "Teacher", key: "teacherName", width: 25 },
      { header: "Level", key: "level", width: 20 },
      { header: "Section", key: "sectionName", width: 20 },
      { header: "Check-In Time", key: "checkInTime", width: 25 },
      { header: "Check-Out Time", key: "checkOutTime", width: 25 },
    ];

    worksheet.getRow(1).font = { bold: true };

    attendanceRecords.forEach((record) => {
      record.periods.forEach((period) => {
        worksheet.addRow({
          teacherName: period.teacher?.teacherName || "Unknown",
          level: record.level?.level || "Unknown",
          sectionName: record.section?.sectionName || "Unknown",
          checkInTime: period.checkInTime
            ? new Date(period.checkInTime).toISOString()
            : "",
          checkOutTime: period.checkOutTime
            ? new Date(period.checkOutTime).toISOString()
            : "",
        });
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
    console.error("Error exporting attendance records to Excel:", error);
    throw new ApiError(500, "Failed to export attendance records to Excel");
  }
});
const updateAttendanceRecord = asyncHandler(async (req, res) => {
  const { attendanceId, periodId } = req.params;
  console.log(attendanceId);
  console.log(periodId);
  const { teacherId, levelId, sectionId, checkInTime, checkOutTime } = req.body;

  if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
    throw new ApiError(400, "Invalid Attendance ID");
  }

  if (!mongoose.Types.ObjectId.isValid(periodId)) {
    throw new ApiError(400, "Invalid Period ID");
  }

  const attendanceRecord = await Attendance.findById(attendanceId);

  if (!attendanceRecord) {
    throw new ApiError(404, "Attendance record not found");
  }

  const period = attendanceRecord.periods.id(periodId);

  if (!period) {
    throw new ApiError(404, "Period not found");
  }

  if (!checkInTime) {
    throw new ApiError(400, "Check-in time is required");
  }

  if (checkOutTime && new Date(checkInTime) > new Date(checkOutTime)) {
    throw new ApiError(
      400,
      "Check-in time cannot be later than check-out time"
    );
  }

  period.teacher = teacherId;
  period.checkInTime = checkInTime;
  period.checkOutTime = checkOutTime;

  if (levelId) {
    attendanceRecord.level = levelId;
  }

  if (sectionId) {
    attendanceRecord.section = sectionId;
  }

  await attendanceRecord.save();

  res.json(
    new ApiResponse(
      200,
      attendanceRecord,
      "Attendance period updated successfully"
    )
  );
});

const deleteAttendanceRecord = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;

  console.log("Attempting to delete attendance record with ID:", attendanceId);

  if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
    throw new ApiError(400, "Invalid Attendance ID");
  }

  const deletedRecord = await Attendance.findByIdAndDelete(attendanceId);

  if (!deletedRecord) {
    throw new ApiError(404, "Attendance record not found");
  }

  res.json(
    new ApiResponse(
      200,
      deletedRecord,
      "Attendance record deleted successfully"
    )
  );
});

export {
  createAttendanceRecord,
  getAttendance,
  getAllAttendanceRecordsInExcel,
  updateAttendanceRecord,
  deleteAttendanceRecord,
};
