import { Router } from "express";

import {
  importProblemController,
  analyzeProblemController,
} from "../controllers/problem.controller.js";

const router = Router();

router.post("/import", importProblemController);

router.post("/analyze", analyzeProblemController);

export default router;