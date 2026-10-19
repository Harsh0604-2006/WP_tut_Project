import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDirectory = path.resolve("uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const imageOnly = (_req, file, callback) => {
  if (file.mimetype.startsWith("image/")) return callback(null, true);
  callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
};

export const uploadReportImage = multer({
  storage,
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");
