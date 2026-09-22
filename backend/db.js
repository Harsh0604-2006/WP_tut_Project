import mongoose from "mongoose";
import Disease from "./models/Disease.js";
import seedDiseases from "./seed/diseases.json" with { type: "json" };

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.warn("MONGODB_URI is not configured; API will run without persistence.");
    return false;
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const diseaseCount = await Disease.countDocuments();
  if (diseaseCount === 0) {
    await Disease.insertMany(seedDiseases);
    console.log(`Seeded ${seedDiseases.length} diseases`);
  }

  return true;
}
