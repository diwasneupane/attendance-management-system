const { Router } = require("express");
const {
  adminRegister,
  changeCurrentPassword,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
} = require("../controllers/admin.controller.js");
const { verifyJwt } = require("../middlewares/auth.middlewares.js");
const { getSystemStats } = require("../controllers/level.cotroller.js");

const router = Router();

router.route("/admin-register").post(adminRegister);
router.route("/admin-login").post(loginAdmin);
router.route("/admin-logout").post(verifyJwt, logoutAdmin);
router.route("/admin-updatePassword").patch(verifyJwt, changeCurrentPassword);
router.route("/admin-getAdmin").get(verifyJwt, getCurrentAdmin);
router.get("/system-stats", getSystemStats);

module.exports = router;
