import { Router } from "express";
import {
  adminRegister,
  changeCurrentPassword,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
} from "../controllers/admin.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { getSystemStats } from "../controllers/level.cotroller.js";

const router = Router();

router.route("/admin-register").post(adminRegister);
router.route("/admin-login").post(loginAdmin);
router.route("/admin-logout").post(verifyJwt, logoutAdmin);
router.route("/admin-updatePassword").patch(verifyJwt, changeCurrentPassword);
router.route("/admin-getAdmin").get(verifyJwt, getCurrentAdmin);
router.get("/system-stats", getSystemStats);

export default router;
