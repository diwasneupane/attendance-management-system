import { Router } from "express";
import {
  createAttendanceRecord,
  getAllAttendanceRecords,
  getAllAttendanceRecordsInExcel,
  updateAttendanceRecord,
  deleteAttendanceRecord,
} from "../controllers/attendace.controller.js";

const router = Router();

router.route("/create-attendance").post(createAttendanceRecord);
router.route("/get-attendance").get(getAllAttendanceRecords);
router.route("/get-attendance-excel").get(getAllAttendanceRecordsInExcel);
router.route("/update-attendance/:attendanceId").put(updateAttendanceRecord);
router.route("/delete-attendance/:attendanceId").delete(deleteAttendanceRecord);

export default router;
