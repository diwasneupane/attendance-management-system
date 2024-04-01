import { Router } from "express";
import {
  createAttendanceRecord,
  getAllAttendanceRecords,
} from "../controllers/attendace.controller.js";

const router = Router();

router.route("/create-attendance").post(createAttendanceRecord);
router.route("/get-attendance").get(getAllAttendanceRecords);

export default router;
