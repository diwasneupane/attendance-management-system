import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes

import adminRoutes from "./routes/admin.router.js";
import levelRoutes from "./routes/level.router.js";

//routeDecleration
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/level", levelRoutes);
export { app };
