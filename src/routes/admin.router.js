import { Router } from "express";
import {
  adminRegister,
  loginAdmin,
  logoutAdmin,
} from "../controllers/admin.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/admin-register").post(adminRegister);
router.route("/admin-login").post(loginAdmin);
router.route("/admin-logout").post(verifyJwt, logoutAdmin);

export default router;
