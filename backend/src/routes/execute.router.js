import { Router } from "express";

import { executeController } from "../controllers/execute.controller.js";

const router = Router();

router.post("/", executeController);

export default router;