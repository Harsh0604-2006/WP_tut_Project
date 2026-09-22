import Disease from "../models/Disease.js";
import Report from "../models/Report.js";

export async function createReport(req, res) {
  const { cropType, symptoms = [] } = req.body;
  if (!cropType || symptoms.length === 0) return res.status(400).json({ message: "Crop type and at least one symptom are required" });

  const diseases = await Disease.find({ cropType });
  const matched = diseases
    .map((disease) => ({ disease, score: symptoms.filter((symptom) => disease.symptoms.includes(symptom)).length }))
    .sort((a, b) => b.score - a.score)[0];

  if (!matched?.score) return res.status(404).json({ message: "No matching disease found" });
  const report = await Report.create({ cropType, symptoms, matchedDisease: matched.disease.name, remedy: matched.disease.remedy, user: req.user?.id });
  res.status(201).json(report);
}

export async function getReports(req, res) {
  const filter = req.user?.id ? { user: req.user.id } : {};
  res.json(await Report.find(filter).sort({ date: -1 }));
}

export async function getDashboardStats(req, res) {
  const filter = req.user?.id ? { user: req.user.id } : {};
  const reports = await Report.find(filter);
  const diseaseCounts = reports.reduce((counts, report) => {
    counts[report.matchedDisease] = (counts[report.matchedDisease] || 0) + 1;
    return counts;
  }, {});
  res.json({ totalReports: reports.length, cropsScanned: new Set(reports.map((report) => report.cropType)).size, diseaseCounts });
}
