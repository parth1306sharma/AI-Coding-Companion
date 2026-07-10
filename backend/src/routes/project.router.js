import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
} from "../controllers/project.controller.js";
const router = Router();
router.post("/", createProject);
router.delete("/:id", deleteProject);
router.get("/", getAllProjects);

router.get("/:id", getProjectById);

router.put("/:id", updateProject);
export default router;