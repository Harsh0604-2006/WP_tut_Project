import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { connectDatabase } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use((error, _req, res, next) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Image must be 5 MB or smaller." });
  }
  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: "Only image files can be attached." });
  }
  next(error);
});

const port = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  connectDatabase().catch((error) => console.error("Database connection failed:", error.message));
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

export { app };
export default app;
