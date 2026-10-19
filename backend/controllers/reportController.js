import Disease from "../models/Disease.js";
import Report from "../models/Report.js";
import { isValidImageBuffer } from "../middleware/uploadMiddleware.js";
import { predictPlantDisease, PredictionServiceError } from "../services/imagePredictionService.js";

export async function createReport(req, res) {
  const { cropType } = req.body;
  const rawSymptoms = req.body.symptoms;
  const symptoms = Array.isArray(rawSymptoms)
    ? rawSymptoms
    : typeof rawSymptoms === "string" && rawSymptoms.trim().length > 0
    ? [rawSymptoms]
    : [];

  if (!cropType || symptoms.length === 0)
    return res.status(400).json({ message: "Crop type and at least one symptom are required" });

  const diseases = await Disease.find({ cropType });
  const matches = diseases
    .map((disease) => ({ disease, score: symptoms.filter((symptom) => disease.symptoms.includes(symptom)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.disease.name.localeCompare(b.disease.name));

  if (!matches.length)
    return res.status(404).json({ message: "No matching disease found" });

  const totalScore = matches.reduce((total, { score }) => total + score, 0);
  const matchedDiseases = matches.map(({ disease, score }) => ({
    name: disease.name,
    remedy: disease.remedy,
    score,
    probability: Math.round((score / totalScore) * 1000) / 10,
  }));
  const report = await Report.create({
    cropType,
    symptoms,
    matchedDisease: matchedDiseases[0].name,
    matchedDiseases,
    remedy: matchedDiseases[0].remedy,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    user: req.user?.id,
  });
  res.status(201).json(report);
}

export async function getReports(req, res) {
  const filter = req.user?.id ? { user: req.user.id } : {};
  res.json(await Report.find(filter).sort({ date: -1 }));
}

export async function getDiseases(req, res) {
  const diseases = await Disease.find({ cropType: req.query.cropType })
    .select("name cropType")
    .sort({ name: 1 });
  res.json(diseases);
}

export async function getDashboardStats(req, res) {
  const filter = req.user?.id ? { user: req.user.id } : {};
  const reports = await Report.find(filter);
  const diseaseCounts = reports.reduce((counts, report) => {
    const diseases = report.matchedDiseases?.length
      ? report.matchedDiseases.map(({ name }) => name)
      : [report.matchedDisease];
    diseases.forEach((name) => {
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, {});
  res.json({ totalReports: reports.length, cropsScanned: new Set(reports.map((report) => report.cropType)).size, diseaseCounts });
}

export async function predictCropImage(req, res) {
  const { cropType } = req.body;
  if (!cropType || (cropType !== "Tomato" && cropType !== "Potato")) {
    return res.status(400).json({ message: "Invalid crop type. Supported crops are Tomato and Potato." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "An image file is required." });
  }

  if (!isValidImageBuffer(req.file.buffer)) {
    return res.status(400).json({ message: "Invalid image format. Allowed formats are JPEG, PNG, and WebP." });
  }

  try {
    const result = await predictPlantDisease({
      imageBuffer: req.file.buffer,
      cropType,
    });
    return res.json(result);
  } catch (err) {
    if (err instanceof PredictionServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return res.status(500).json({ message: "An unexpected error occurred during prediction." });
  }
}
