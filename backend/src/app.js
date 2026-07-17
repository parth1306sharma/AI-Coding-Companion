import express from "express";
import cors from "cors";

import folderRouter from "./routes/folder.router.js";
import userRouter from "./routes/user.router.js";
import projectRouter from "./routes/project.router.js";
import fileRouter from "./routes/file.router.js";
import aiRouter from "./routes/ai.router.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/folders", folderRouter);
app.use("/api/v1/files", fileRouter);
app.use("/api/v1/ai", aiRouter);

export default app;