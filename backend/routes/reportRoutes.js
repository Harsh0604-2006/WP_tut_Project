import { Router } from "express";
import { createReport, getDashboardStats, getReports } from "../controllers/reportController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/", createReport);
router.get("/", getReports);
router.get("/stats", getDashboardStats);
export default router;
