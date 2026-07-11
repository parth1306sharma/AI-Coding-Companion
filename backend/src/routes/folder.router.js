import { Router } from "express";

import {
  createFolder,
  getProjectTree,
} from "../controllers/folder.controller.js";

const router = Router();

router.post("/", createFolder);

router.get("/tree/:projectId", getProjectTree);

export default router;