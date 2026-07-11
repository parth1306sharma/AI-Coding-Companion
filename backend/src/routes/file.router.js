import { Router } from "express";
import {
  createFile,
  getFileById,
  updateFile,
  deleteFile,
} from "../controllers/file.controller.js";
const router = Router();

router.post("/", createFile);
router.get("/:id", getFileById);
router.put("/:id", updateFile);
router.delete("/:id", deleteFile);
export default router;