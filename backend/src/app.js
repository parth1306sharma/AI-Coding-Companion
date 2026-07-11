import express from "express";
import cors from "cors";
import folderRouter from "./routes/folder.router.js";
import userRouter from "./routes/user.router.js";
import projectRouter from "./routes/project.router.js";
import fileRouter from "./routes/file.router.js";
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/v1/files", fileRouter);
// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/folders", folderRouter);
export default app;