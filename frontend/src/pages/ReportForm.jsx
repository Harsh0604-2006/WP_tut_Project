import { useEffect, useRef, useState } from "react";
import { assetUrl, reportsApi } from "../api.js";

const symptomCrops = ["Cotton", "Tomato", "Potato", "Cucumber"];
const imageCrops = ["Tomato", "Potato"];

const symptoms = [
  "Leaf spots (yellow/brown/black)",
  "Yellowing leaves",
  "Wilting",
  "Leaf curling",
  "White/gray powdery coating",
  "Stunted growth",
  "Rotting stem/root",
  "Holes in leaves",
  "Discoloration of fruit/grain",
  "Leaf drop",
  "Mosaic pattern on leaves",
  "Lesions on fruit",
  "Soft or mushy roots",
  "Brown leaf edges",
  "Fruit cracking",
  "Stem cankers",
  "Premature leaf fall",
  "Visible insects",
  "Poor fruit set",
  "Water-soaked lesions",
  "Leaf vein discoloration",
];

function ReportForm({ onComplete }) {
  const [mode, setMode] = useState("symptoms"); // "symptoms" | "image"

  // Symptom-based state
  const [cropType, setCropType] = useState("Tomato");
  const [selected, setSelected] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [error, setError] = useState("");
  const imagePreviewRef = useRef("");

  // Image-based prediction state
  const [imageCropType, setImageCropType] = useState("Tomato");
  const [leafFile, setLeafFile] = useState(null);
  const [leafPreviewUrl, setLeafPreviewUrl] = useState("");
  const [imageResult, setImageResult] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const leafPreviewRef = useRef("");

  useEffect(() => {
    if (!selectedMatch) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedMatch(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selectedMatch]);

  useEffect(() => () => {
    if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
    if (leafPreviewRef.current) URL.revokeObjectURL(leafPreviewRef.current);
  }, []);

  const toggle = (symptom) =>
    setSelected((current) =>
      current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]
    );

  const submitSymptoms = async (event) => {
    event.preventDefault();
    setError("");
    if (!selected.length) return setError("Choose at least one visible symptom.");
    try {
      setResult(await reportsApi.create({ cropType, symptoms: selected, image }));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "The report could not be saved. Check that the backend is running."
      );
    }
  };

  const handleLeafFileChange = (event) => {
    if (leafPreviewRef.current) URL.revokeObjectURL(leafPreviewRef.current);
    const nextFile = event.target.files[0] || null;
    leafPreviewRef.current = nextFile ? URL.createObjectURL(nextFile) : "";
    setLeafFile(nextFile);
    setLeafPreviewUrl(leafPreviewRef.current);
    setImageResult(null);
    setImageError("");
  };

  const submitImagePrediction = async (event) => {
    event.preventDefault();
    setImageError("");
    if (!leafFile) {
      return setImageError("Please select a leaf image file first.");
    }
    if (leafFile.size > 5 * 1024 * 1024) {
      return setImageError("Image must be 5 MB or smaller.");
    }
    setImageLoading(true);
    try {
      const response = await reportsApi.predictImage({
        cropType: imageCropType,
        image: leafFile,
      });
      setImageResult(response);
    } catch (err) {
      setImageError(
        err.response?.data?.message ||
          "Failed to analyze leaf image. Please ensure the backend is running and configured."
      );
    } finally {
      setImageLoading(false);
    }
  };

  const matches =
    result?.matchedDiseases || (result ? [{ name: result.matchedDisease, remedy: result.remedy }] : []);
  const totalScore = matches.reduce((total, disease) => total + (disease.score || 0), 0);
  const getProbability = (disease) =>
    disease.probability ?? (totalScore ? Math.round((disease.score / totalScore) * 1000) / 10 : null);
  const attachedImageUrl = result?.imageUrl ? assetUrl(result.imageUrl) : imagePreviewUrl;

  return (
    <section className="page form-page">
      <div className="eyebrow">VrukshSaathi / NEW OBSERVATION</div>
      <h1>Read the leaves.</h1>
      <p className="lede">
        Diagnose plant health through symptom assessment or AI-powered leaf photo classification.
      </p>

      <div className="mode-switch" role="tablist" aria-label="Diagnosis Mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "symptoms"}
          className={mode === "symptoms" ? "mode-switch-button active" : "mode-switch-button"}
          onClick={() => setMode("symptoms")}
        >
          Symptom Diagnosis
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "image"}
          className={mode === "image" ? "mode-switch-button active" : "mode-switch-button"}
          onClick={() => setMode("image")}
        >
          AI Image Detection
        </button>
      </div>

      {mode === "symptoms" && (
        <>
          <form onSubmit={submitSymptoms} className="report-form">
            <label>
              Crop
              <select
                value={cropType}
                onChange={(event) => {
                  setCropType(event.target.value);
                  setSelected([]);
                  setImage(null);
                  if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
                  imagePreviewRef.current = "";
                  setImagePreviewUrl("");
                  setResult(null);
                  setSelectedMatch(null);
                }}
              >
                {symptomCrops.map((crop) => (
                  <option key={crop}>{crop}</option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend>Visible symptoms</legend>
              <div className="symptom-grid">
                {symptoms.map((symptom) => (
                  <label
                    className={selected.includes(symptom) ? "symptom selected" : "symptom"}
                    key={symptom}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(symptom)}
                      onChange={() => toggle(symptom)}
                    />
                    {symptom}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="image-upload">
              Crop image (optional)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
                  const nextImage = event.target.files[0] || null;
                  imagePreviewRef.current = nextImage ? URL.createObjectURL(nextImage) : "";
                  setImage(nextImage);
                  setImagePreviewUrl(imagePreviewRef.current);
                }}
              />
              {image && <span>{image.name}</span>}
            </label>

            {error && <p className="form-error">{error}</p>}
            <button className="primary-button" type="submit">
              Analyze crop ↗
            </button>
          </form>

          {result && (
            <div className="result-box">
              <div className="eyebrow">
                {matches.length > 1 ? "POSSIBLE MATCHES" : "MATCH FOUND"}
              </div>
              <p className="result-note">Relative match probability based on the symptoms selected.</p>
              {attachedImageUrl && (
                <img className="report-image" src={attachedImageUrl} alt="Attached crop" />
              )}
              {matches.map((disease) => (
                <button
                  className="result-match result-match-button"
                  type="button"
                  key={disease.name}
                  onClick={() => setSelectedMatch(disease)}
                >
                  <div className="result-heading">
                    <h2>{disease.name}</h2>
                    {getProbability(disease) !== null && (
                      <strong>{getProbability(disease)}%</strong>
                    )}
                  </div>
                  <p>{disease.remedy}</p>
                  <span className="match-action">View details ↗</span>
                </button>
              ))}
              <button className="text-button" onClick={onComplete}>
                View report history →
              </button>
            </div>
          )}

          {selectedMatch && (
            <div className="overlay" role="presentation" onClick={() => setSelectedMatch(null)}>
              <div
                className="match-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="match-title"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="modal-close"
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  aria-label="Close disease details"
                >
                  ×
                </button>
                {attachedImageUrl ? (
                  <img className="modal-image" src={attachedImageUrl} alt="Attached crop" />
                ) : (
                  <div className="modal-image-placeholder">No crop image attached</div>
                )}
                <div className="eyebrow">DISEASE MATCH</div>
                <div className="modal-heading">
                  <h2 id="match-title">{selectedMatch.name}</h2>
                  {getProbability(selectedMatch) !== null && (
                    <strong>{getProbability(selectedMatch)}%</strong>
                  )}
                </div>
                <div className="modal-recommendation">
                  <div className="eyebrow">RECOMMENDATION</div>
                  <p>{selectedMatch.remedy || "No recommendation available."}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {mode === "image" && (
        <>
          <form onSubmit={submitImagePrediction} className="report-form">
            <label>
              Crop
              <select
                value={imageCropType}
                onChange={(event) => {
                  setImageCropType(event.target.value);
                  setImageResult(null);
                  setImageError("");
                }}
              >
                {imageCrops.map((crop) => (
                  <option key={crop}>{crop}</option>
                ))}
              </select>
            </label>

            <label className="image-upload">
              Leaf Photo (JPEG, PNG, or WebP up to 5 MB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLeafFileChange}
              />
              {leafFile && <span>{leafFile.name} ({(leafFile.size / 1024).toFixed(1)} KB)</span>}
              <p className="privacy-note">
                Privacy notice: Uploaded leaf images are sent to Hugging Face Inference API for automated classification.
              </p>
            </label>

            {imageError && <p className="form-error">{imageError}</p>}

            <button
              className="primary-button"
              type="submit"
              disabled={imageLoading || !leafFile}
            >
              {imageLoading ? "Detecting disease..." : "Detect disease from image ↗"}
            </button>
          </form>

          {imageResult?.status === "uncertain" && (
            <div className="uncertain-box" role="alert">
              <div className="eyebrow">CLASSIFICATION UNCERTAIN</div>
              <h2>Result Uncertain</h2>
              <p>{imageResult.message || "The result is uncertain. Try a clearer leaf image."}</p>
              <div className="prediction-meta">
                Highest confidence: <strong>{Math.round((imageResult.confidence || 0) * 100)}%</strong> (Below confidence threshold)
              </div>
              <p className="result-note">
                Try uploading a close-up photo with good lighting and clear view of leaf symptoms.
              </p>
            </div>
          )}

          {imageResult?.status === "success" && (
            <div className="result-box">
              <div className="eyebrow">AI PREDICTION · {imageResult.cropType.toUpperCase()}</div>
              <div className="result-heading">
                <h2>{imageResult.disease}</h2>
                <strong>{Math.round(imageResult.confidence * 100)}% CONFIDENCE</strong>
              </div>
              <div className="prediction-meta">
                Model class: <code>{imageResult.modelLabel}</code>
              </div>

              {leafPreviewUrl && (
                <img className="report-image" src={leafPreviewUrl} alt="Analyzed crop leaf" />
              )}

              {imageResult.remedy ? (
                <div className="modal-recommendation">
                  <div className="eyebrow">RECOMMENDED REMEDY &amp; PREVENTION</div>
                  <p>{imageResult.remedy}</p>
                </div>
              ) : (
                <p className="no-remedy-note">
                  No specific treatment guide is currently recorded in the database for this condition.
                </p>
              )}

              {imageResult.predictions?.length > 1 && (
                <div className="prediction-list">
                  <div className="prediction-list-title">Top candidate predictions</div>
                  {imageResult.predictions.map((p) => (
                    <div className="prediction-item" key={p.modelLabel}>
                      <span>{p.disease}</span>
                      <strong>{Math.round(p.confidence * 100)}%</strong>
                    </div>
                  ))}
                </div>
              )}

              <p className="result-note" style={{ marginTop: "18px" }}>
                Confidence scores are heuristic estimates produced by MobileNetV2 and not a clinical diagnosis.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ReportForm;
