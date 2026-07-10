import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    createProject,
    getAllProjects,
} from "../controllers/project.controller.js";

const router = Router();
router.post("/", createProject);

router.get("/", getAllProjects);

export default router;