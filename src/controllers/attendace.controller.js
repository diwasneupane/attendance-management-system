const { Attendance } = require("../models/attendance.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { ApiError } = require("../utils/ApiError.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { Teacher } = require("../models/teacher.model.js");
const { Level, Section } = require("../models/level.model.js");
const Excel = require("exceljs");
const mongoose = require("mongoose");
const moment = require("moment");

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

  const level = await Level.findById(levelId);
  if (!level) {
    throw new ApiError(404, "Level not found");
  }

  const section = await Section.findById(sectionId);
  if (!section) {
    throw new ApiError(404, "Section not found");
  }

  const teachers = periods.map((period) => period.teacher);
  const invalidTeachers = teachers.filter(
    (teacherId) => !teacherId || !isValidTeacher(teacherId)
  );
  if (invalidTeachers.length > 0) {
    throw new ApiError(404, "Teacher not found");
  }

  const updatedPeriods = periods.map((period) => {
    const createdAt = new Date().toISOString();

    const checkInTime = period.checkInTime || createdAt;
    const checkOutTime = period.checkOutTime || createdAt;

    return {
      ...period,
      level: levelId,
      section: sectionId,
      checkInTime,
      checkOutTime,
    };
  });

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

const isValidTeacher = async (teacherId) => {
  const teacher = await Teacher.findById(teacherId);
  return teacher !== null;
};
const getAttendance = asyncHandler(async (req, res) => {
  const { checkInTimeRange } = req.query;
  let filter = {};

  if (checkInTimeRange) {
    const [start, end] = checkInTimeRange.split("_");
    if (start && end) {
      const startDate = new Date(start);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(end);
      endDate.setUTCHours(23, 59, 59, 999);

      filter["periods.checkInTime"] = {
        $gte: startDate,
        $lte: endDate,
      };
    }
  }

  const attendanceRecords = await Attendance.find(filter)
    .populate("periods.teacher", "teacherName")
    .populate("level", "level")
    .populate("section", "sectionName")
    .sort({ "periods.checkInTime": -1 });

  if (!attendanceRecords || attendanceRecords.length === 0)
    throw new ApiError(404, "No attendance records found");

  const allPeriods = attendanceRecords.flatMap((record) =>
    record.periods.map((period) => ({
      _id: period._id,
      teacher: period.teacher?.teacherName || "Unknown Teacher",
      level: record.level?.level || "Unknown Level",
      section: record.section?.sectionName || "Unknown Section",
      checkInTime: period.checkInTime?.toLocaleString(),
      checkOutTime: period.checkOutTime
        ? period.checkOutTime.toLocaleString()
        : "",
    }))
  );

  if (!allPeriods || allPeriods.length === 0)
    throw new ApiError(404, "No periods found");

  res.json(
    new ApiResponse(200, allPeriods, "All periods fetched successfully")
  );
});

const getAllAttendanceRecordsInExcel = asyncHandler(async (req, res) => {
  try {
    const { checkInTimeRange } = req.query;
    let filter = {};
    if (checkInTimeRange) {
      const [start, end] = checkInTimeRange.split("_");
      if (start && end) {
        // Convert the end date to include records for the entire day
        const endDate = new Date(end);
        endDate.setDate(endDate.getDate() + 1);

        // Adjust the filter to include records within the date range
        filter["periods.checkInTime"] = {
          $gte: new Date(start),
          $lt: endDate, // Use $lt to include records up to the end of the specified end date
        };
      }
    }

    const attendanceRecords = await Attendance.find(filter)
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
            ? moment(period.checkInTime).format("YYYY-MM-DD HH:mm:ss")
            : "",
          checkOutTime: period.checkOutTime
            ? moment(period.checkOutTime).format("YYYY-MM-DD HH:mm:ss")
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

  const attendanceRecord = await Attendance.findOne({
    "periods._id": periodId,
  });

  if (!attendanceRecord) {
    throw new ApiError(404, "Attendance record not found");
  }

  const periodIndex = attendanceRecord.periods.findIndex(
    (p) => p._id.toString() === periodId
  );

  if (periodIndex === -1) {
    throw new ApiError(404, "Period not found in Attendance record");
  }

  attendanceRecord.periods.splice(periodIndex, 1);

  await attendanceRecord.save();

  res.json(new ApiResponse(200, null, "Period deleted successfully"));
});

module.exports = {
  createAttendanceRecord,
  getAttendance,
  getAllAttendanceRecordsInExcel,
  updateAttendanceRecord,
  deleteAttendanceRecord,
};
