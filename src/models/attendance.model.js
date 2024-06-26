const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const periodSchema = new Schema(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: "Level",
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
    checkInTime: {
      type: Date,
      // required: true,
    },
    checkOutTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Period = mongoose.model("Period", periodSchema);
const attendanceSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    periods: [periodSchema],
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = { Attendance, Period };
