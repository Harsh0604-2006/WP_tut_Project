import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

const port = process.env.PORT || 5000;
connectDatabase().catch((error) => console.error("Database connection failed:", error.message));
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
