import { Attendance, Period } from "../models/attendance.model.js";
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

const getAttendance = asyncHandler(async (req, res) => {
  const attendanceRecords = await Attendance.find()
    .populate("periods.teacher", "teacherName")
    .populate("level", "level")
    .populate("section", "sectionName");

  if (!attendanceRecords || attendanceRecords.length === 0) {
    throw new ApiError(404, "No attendance records found");
  }

  const allPeriods = attendanceRecords.flatMap((record) => {
    return record.periods.map((period) => ({
      _id: period._id,
      teacher: period.teacher?.teacherName || "Unknown Teacher",
      level: record.level?.level || "Unknown Level",
      section: record.section?.sectionName || "Unknown Section",
      checkInTime: period.checkInTime?.toISOString(),
      checkOutTime: period.checkOutTime
        ? period.checkOutTime.toISOString()
        : "",
    }));
  });

  if (!allPeriods || allPeriods.length === 0) {
    throw new ApiError(404, "No periods found");
  }

  res.json(
    new ApiResponse(200, allPeriods, "All periods fetched successfully")
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
  const { periodId } = req.params;
  const { teacherId, checkInTime, checkOutTime, levelId, sectionId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(periodId)) {
    throw new ApiError(400, "Invalid Period ID");
  }

  const attendanceRecord = await Attendance.findOne({
    "periods._id": periodId,
  });

  if (!attendanceRecord) {
    throw new ApiError(404, "Attendance record not found");
  }

  const period = attendanceRecord.periods.id(periodId);

  if (!period) {
    throw new ApiError(404, "Period not found");
  }

  if (teacherId) {
    period.teacher = teacherId;
  }

  if (checkInTime) {
    period.checkInTime = checkInTime;
  }

  if (checkOutTime) {
    period.checkOutTime = checkOutTime;
  }

  if (levelId) {
    period.level = levelId;
  }

  if (sectionId) {
    period.section = sectionId;
  }

  await attendanceRecord.save();

  res.json(new ApiResponse(200, period, "Period updated successfully"));
});

const deleteAttendanceRecord = asyncHandler(async (req, res) => {
  const { periodId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(periodId)) {
    throw new ApiError(400, "Invalid Period ID");
  }

  console.log("Valid period ID:", periodId);

  const attendanceRecord = await Attendance.findOne({
    "periods._id": periodId,
  });

  console.log("Attendance record:", attendanceRecord);

  if (!attendanceRecord) {
    console.log("Attendance record not found");
    throw new ApiError(404, "Attendance record not found");
  }

  const periodIndex = attendanceRecord.periods.findIndex(
    (p) => p._id.toString() === periodId
  );

  if (periodIndex === -1) {
    console.log("Period not found in Attendance record");
    throw new ApiError(404, "Period not found in Attendance record");
  }

  attendanceRecord.periods.splice(periodIndex, 1);

  await attendanceRecord.save();

  console.log("Period deleted successfully");

  res.json(new ApiResponse(200, null, "Period deleted successfully"));
});

export {
  createAttendanceRecord,
  getAttendance,
  getAllAttendanceRecordsInExcel,
  updateAttendanceRecord,
  deleteAttendanceRecord,
};
