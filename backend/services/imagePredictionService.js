import { InferenceClient } from "@huggingface/inference";
import Disease from "../models/Disease.js";

// Label mapping for neghani/plantvillage-mobilenetv2
export const MODEL_LABEL_MAPPING = {
  // Tomato classes
  Tomato___Bacterial_spot: {
    crop: "Tomato",
    displayName: "Tomato Bacterial Spot",
    dbName: null,
  },
  Tomato___Early_blight: {
    crop: "Tomato",
    displayName: "Early Blight",
    dbName: "Early Blight",
  },
  Tomato___Late_blight: {
    crop: "Tomato",
    displayName: "Late Blight",
    dbName: "Late Blight",
  },
  Tomato___Leaf_Mold: {
    crop: "Tomato",
    displayName: "Tomato Leaf Mold",
    dbName: null,
  },
  Tomato___Septoria_leaf_spot: {
    crop: "Tomato",
    displayName: "Tomato Septoria Leaf Spot",
    dbName: null,
  },
  "Tomato___Spider_mites Two-spotted_spider_mite": {
    crop: "Tomato",
    displayName: "Two-Spotted Spider Mite",
    dbName: null,
  },
  Tomato___Target_Spot: {
    crop: "Tomato",
    displayName: "Tomato Target Spot",
    dbName: null,
  },
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: {
    crop: "Tomato",
    displayName: "Tomato Leaf Curl",
    dbName: "Tomato Leaf Curl",
  },
  Tomato___Tomato_mosaic_virus: {
    crop: "Tomato",
    displayName: "Tomato Mosaic Virus",
    dbName: null,
  },
  Tomato___healthy: {
    crop: "Tomato",
    displayName: "Healthy Tomato",
    dbName: null,
    isHealthy: true,
  },

  // Potato classes
  Potato___Early_blight: {
    crop: "Potato",
    displayName: "Potato Early Blight",
    dbName: "Potato Early Blight",
  },
  Potato___Late_blight: {
    crop: "Potato",
    displayName: "Late Blight",
    dbName: "Late Blight",
  },
  Potato___healthy: {
    crop: "Potato",
    displayName: "Healthy Potato",
    dbName: null,
    isHealthy: true,
  },
};

const DEFAULT_MODEL = "neghani/plantvillage-mobilenetv2";
const DEFAULT_CONFIDENCE_THRESHOLD = 0.4;

export class PredictionServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "PredictionServiceError";
    this.statusCode = statusCode;
  }
}

/**
 * Extracts crop name from model label prefix (e.g., 'Tomato___Early_blight' -> 'Tomato')
 */
export function getCropFromLabel(label) {
  if (!label) return "";
  const parts = label.split("___");
  if (parts.length > 1) {
    return parts[0].replace(/_/g, " ").trim();
  }
  return "";
}

/**
 * Calls Hugging Face inference API and processes the plant disease prediction
 */
export async function predictPlantDisease({ imageBuffer, cropType }) {
  const token = process.env.HF_TOKEN?.trim();
  const model = process.env.HF_MODEL?.trim() || DEFAULT_MODEL;
  const threshold = parseFloat(process.env.CONFIDENCE_THRESHOLD || String(DEFAULT_CONFIDENCE_THRESHOLD));

  if (!token || token === "your_hugging_face_access_token") {
    throw new PredictionServiceError(
      "Image classification service is not configured. Please set HF_TOKEN in the server environment.",
      503
    );
  }

  const client = new InferenceClient(token);
  const controller = new AbortController();
  const timeoutMs = parseInt(process.env.HF_TIMEOUT_MS || "15000", 10);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let rawPredictions;
  try {
    rawPredictions = await client.imageClassification(
      {
        model,
        data: imageBuffer,
      },
      { signal: controller.signal }
    );
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" || err.message?.includes("aborted")) {
      throw new PredictionServiceError("Image classification request timed out.", 504);
    }
    const message = err.message || "";
    if (message.includes("401") || message.includes("Unauthorized") || message.includes("credentials")) {
      throw new PredictionServiceError(
        "Image classification service authorization failed. Please verify HF_TOKEN.",
        502
      );
    }
    if (message.includes("503") || message.includes("loading") || message.includes("currently loading")) {
      throw new PredictionServiceError(
        "Image classification model is currently loading or unavailable. Please try again shortly.",
        503
      );
    }
    throw new PredictionServiceError(
      "Image classification service request failed. Please try again.",
      502
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!Array.isArray(rawPredictions) || rawPredictions.length === 0) {
    return {
      status: "uncertain",
      message: "The result is uncertain. Try a clearer leaf image.",
      confidence: 0,
    };
  }

  // Sort raw predictions by score descending
  const sorted = [...rawPredictions].sort((a, b) => b.score - a.score);
  const topOverall = sorted[0];

  // Predictions that correspond to the selected cropType
  const cropPredictions = sorted.filter((p) => {
    const cropFromLabel = getCropFromLabel(p.label);
    return cropFromLabel.toLowerCase() === cropType.toLowerCase();
  });

  // If no predictions match the selected crop, or top prediction for the crop is too weak
  if (cropPredictions.length === 0) {
    return {
      status: "uncertain",
      message: "The result is uncertain. Try a clearer leaf image.",
      confidence: Math.round(topOverall.score * 100) / 100,
    };
  }

  const topCropPrediction = cropPredictions[0];
  const roundedConfidence = Math.round(topCropPrediction.score * 100) / 100;

  // Check uncertainty heuristics:
  // 1. If overall top prediction belongs to a completely different crop and has significantly higher confidence
  const topOverallCrop = getCropFromLabel(topOverall.label);
  const isDifferentCropDominant =
    topOverallCrop &&
    topOverallCrop.toLowerCase() !== cropType.toLowerCase() &&
    topOverall.score > 0.6 &&
    topCropPrediction.score < threshold;

  // 2. If the confidence for the selected crop is below the threshold
  if (topCropPrediction.score < threshold || isDifferentCropDominant) {
    return {
      status: "uncertain",
      message: "The result is uncertain. Try a clearer leaf image.",
      confidence: roundedConfidence,
    };
  }

  // Map the top prediction to human-readable disease name and database record
  const mapping = MODEL_LABEL_MAPPING[topCropPrediction.label] || {
    crop: cropType,
    displayName: topCropPrediction.label.replace(/^.*?___/, "").replace(/_/g, " "),
    dbName: null,
  };

  let remedy = null;
  if (mapping.dbName) {
    const diseaseRecord = await Disease.findOne({
      cropType,
      name: mapping.dbName,
    });
    if (diseaseRecord && diseaseRecord.remedy) {
      remedy = diseaseRecord.remedy;
    }
  }

  // Format predictions list
  const formattedPredictions = cropPredictions.slice(0, 5).map((p) => {
    const itemMapping = MODEL_LABEL_MAPPING[p.label];
    return {
      disease: itemMapping?.displayName || p.label.replace(/^.*?___/, "").replace(/_/g, " "),
      modelLabel: p.label,
      confidence: Math.round(p.score * 100) / 100,
    };
  });

  return {
    status: "success",
    cropType,
    modelLabel: topCropPrediction.label,
    disease: mapping.displayName,
    confidence: roundedConfidence,
    remedy,
    predictions: formattedPredictions,
  };
}
