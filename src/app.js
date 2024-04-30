import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet"; // Security headers
import adminRoutes from "./routes/admin.router.js";
import levelRoutes from "./routes/level.router.js";
import teacherRoutes from "./routes/teacher.router.js";
import attendanceRoutes from "./routes/attendance.router.js";
import pinRoutes from "./routes/pin.router.js";

const app = express();

app.use(helmet()); // Security middleware

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/level", levelRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/pin", pinRoutes);

export { app };
