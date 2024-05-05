import { Router } from "express";
import {
  createAttendanceRecord,
  getAllAttendanceRecordsInExcel,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  getAttendance,
} from "../controllers/attendace.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create-attendance").post(createAttendanceRecord);
router.route("/get-attendance").get(getAttendance);
router
  .route("/get-attendance-excel")
  .get(verifyJwt, getAllAttendanceRecordsInExcel);
router
  .route("/update-attendance/:periodId")
  .put(verifyJwt, updateAttendanceRecord);
router
  .route("/delete-attendance/:periodId")
  .delete(verifyJwt, deleteAttendanceRecord);

export default router;
