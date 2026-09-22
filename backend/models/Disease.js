import mongoose from "mongoose";

const diseaseSchema = new mongoose.Schema(
  {
    cropType: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    symptoms: { type: [String], default: [] },
    remedy: { type: String, required: true },
  },
  { timestamps: true },
);

diseaseSchema.index({ cropType: 1 });

export default mongoose.model("Disease", diseaseSchema);
