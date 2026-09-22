import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    cropType: { type: String, required: true, trim: true },
    symptoms: { type: [String], required: true },
    matchedDisease: { type: String, required: true },
    remedy: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Report", reportSchema);
