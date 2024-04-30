import express from "express";
import {
  addPin,
  updatePin,
  deletePin,
  validatePin,
  viewPins,
} from "../controllers/pin.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/validate", validatePin);

router.post("/add", verifyJwt, addPin);
router.put("/update/:pinId", verifyJwt, updatePin);
router.delete("/delete/:pinId", verifyJwt, deletePin);
router.get("/view", verifyJwt, viewPins);

export default router;
