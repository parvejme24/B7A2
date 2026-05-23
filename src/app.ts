import cors from "cors";
import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import issuesRoutes from "./modules/issues/issues.routes";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { sendSuccess } from "./utils/response";
import { StatusCodes } from "http-status-codes";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin === "*" ? "*" : env.corsOrigin.split(","),
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  sendSuccess(res, StatusCodes.OK, {
    name: "DevPulse",
    description: "Internal Tech Issue & Feature Tracker API",
    version: "1.0.0",
    documentation: "See README.md for full API details",
    endpoints: {
      auth: {
        signup: "POST /api/auth/signup",
        login: "POST /api/auth/login",
      },
      issues: {
        create: "POST /api/issues",
        list: "GET /api/issues",
        getOne: "GET /api/issues/:id",
        update: "PATCH /api/issues/:id",
        delete: "DELETE /api/issues/:id",
      },
      health: "GET /health",
    },
  }, "Welcome to DevPulse API");
});

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "DevPulse API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issuesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
