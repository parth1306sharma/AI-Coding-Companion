import { Router } from "express";
import {
  importProblemController,
} from "../controllers/problem.controller.js";

const router = Router();

router.post("/import", importProblemController);

export default router;