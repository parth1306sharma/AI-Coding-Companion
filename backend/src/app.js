import express from "express";
import cors from "cors";

import userRouter from "./routes/user.router.js";
import projectRouter from "./routes/project.router.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);

export default app;