const { Router } = require("express");
const {
  createAttendanceRecord,
  getAllAttendanceRecordsInExcel,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  getAttendance,
} = require("../controllers/attendace.controller.js");
const { verifyJwt } = require("../middlewares/auth.middlewares.js");

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

module.exports = router;
