const express = require("express");
const {
  addPin,
  updatePin,
  deletePin,
  validatePin,
  viewPins,
} = require("../controllers/pin.controller.js");
const { verifyJwt } = require("../middlewares/auth.middlewares.js");

const router = express.Router();

router.post("/validate", validatePin);

router.post("/add", verifyJwt, addPin);
router.put("/update/:pinId", verifyJwt, updatePin);
router.delete("/delete/:pinId", verifyJwt, deletePin);
router.get("/view", verifyJwt, viewPins);

module.exports = router;
