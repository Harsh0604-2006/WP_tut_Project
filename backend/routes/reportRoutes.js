import { Router } from "express";
import { createReport, getDashboardStats, getDiseases, getReports } from "../controllers/reportController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);
router.post("/", createReport);
router.get("/", getReports);
router.get("/diseases", getDiseases);
router.get("/stats", getDashboardStats);
export default router;
