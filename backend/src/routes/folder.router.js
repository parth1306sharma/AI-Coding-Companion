import { Router } from "express";
import { createFolder } from "../controllers/folder.controller.js";

const router = Router();

router.post("/", createFolder);

export default router;