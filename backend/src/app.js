import express from "express";
import cors from "cors";

import problemRouter from "./routes/problem.router.js";
import folderRouter from "./routes/folder.router.js";
import userRouter from "./routes/user.router.js";
import projectRouter from "./routes/project.router.js";
import fileRouter from "./routes/file.router.js";
import aiRouter from "./routes/ai.router.js";
import executeRouter from "./routes/execute.router.js";

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://offbyone-kappa.vercel.app",
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/v1/problem", problemRouter);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/folders", folderRouter);
app.use("/api/v1/files", fileRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/execute", executeRouter);

export default app;