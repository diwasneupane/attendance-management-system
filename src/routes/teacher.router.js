import { Router } from "express";
import {
  CreateTeacher,
  deleteTeacher,
  updateTeacher,
  getTeachers,
} from "../controllers/teacher.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create-teacher").post(verifyJwt, CreateTeacher);
router.route("/update-teacher/:teacherId").patch(verifyJwt, updateTeacher);
router.route("/delete-teacher/:teacherId").delete(verifyJwt, deleteTeacher);
router.route("/get-teachers").get(getTeachers);

export default router;
