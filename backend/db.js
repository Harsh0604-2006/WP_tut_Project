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

  await Disease.bulkWrite(seedDiseases.map((disease) => ({
    updateOne: {
      filter: { cropType: disease.cropType, name: disease.name },
      update: { $set: disease },
      upsert: true,
    },
  })));
  console.log(`Synced ${seedDiseases.length} diseases`);

  return true;
}
