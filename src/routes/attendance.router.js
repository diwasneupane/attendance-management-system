import { Router } from "express";
import {
  createAttendanceRecord,
  getAllAttendanceRecordsInExcel,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  getAttendance,
} from "../controllers/attendace.controller.js";

const router = Router();

router.route("/create-attendance").post(createAttendanceRecord);
router.route("/get-attendance").get(getAttendance);
router.route("/get-attendance-excel").get(getAllAttendanceRecordsInExcel);
router.route("/update-attendance/:periodId").put(updateAttendanceRecord);
router.route("/delete-attendance/:periodId").delete(deleteAttendanceRecord);

export default router;
