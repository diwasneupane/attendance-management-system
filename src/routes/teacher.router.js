const { Router } = require("express");
const {
  CreateTeacher,
  deleteTeacher,
  updateTeacher,
  getTeachers,
} = require("../controllers/teacher.controller.js");
const { verifyJwt } = require("../middlewares/auth.middlewares.js");

const router = Router();

router.route("/create-teacher").post(verifyJwt, CreateTeacher);
router.route("/update-teacher/:teacherId").patch(verifyJwt, updateTeacher);
router.route("/delete-teacher/:teacherId").delete(verifyJwt, deleteTeacher);
router.route("/get-teachers").get(getTeachers);

module.exports = router;
