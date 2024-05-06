const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const adminRoutes = require("./routes/admin.router.js");
const levelRoutes = require("./routes/level.router.js");
const teacherRoutes = require("./routes/teacher.router.js");
const attendanceRoutes = require("./routes/attendance.router.js");
const pinRoutes = require("./routes/pin.router.js");

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

app.get("/", (req, res) => {
  res.send("hello world");
});
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/level", levelRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/pin", pinRoutes);

module.exports = { app };
