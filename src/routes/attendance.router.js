import { Router } from "express";
import {
  createAttendanceRecord,
  getAllAttendanceRecords,
  getAllAttendanceRecordsInExcel,
} from "../controllers/attendace.controller.js";

const router = Router();

router.route("/create-attendance").post(createAttendanceRecord);
router.route("/get-attendance").get(getAllAttendanceRecords);
router.route("/get-attendance-excel").get(getAllAttendanceRecordsInExcel);

export default router;
