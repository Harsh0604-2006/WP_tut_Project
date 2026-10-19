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

export const uploadPredictionImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

export function isValidImageBuffer(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 12) return false;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }
  // WebP: RIFF .... WEBP
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return true;
  }
  return false;
}
