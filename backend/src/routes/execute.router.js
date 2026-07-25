import { Router } from "express";

import {
  executeController,
  executeLeetCodeController,
} from "../controllers/execute.controller.js";

const router = Router();

router.post("/", executeController);
router.post("/leetcode", executeLeetCodeController);

export default router;