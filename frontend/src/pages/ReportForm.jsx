import { useEffect, useRef, useState } from "react";
import { assetUrl, reportsApi } from "../api.js";

const crops = ["Cotton", "Tomato", "Potato", "Cucumber"];
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
  const [cropType, setCropType] = useState("Tomato");
  const [selected, setSelected] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [error, setError] = useState("");
  const imagePreviewRef = useRef("");
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
  }, []);
  const toggle = (symptom) => setSelected((current) => current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]);
  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (!selected.length) return setError("Choose at least one visible symptom.");
    try {
      setResult(await reportsApi.create({ cropType, symptoms: selected, image }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "The report could not be saved. Check that the backend is running.");
    }
  };
  const matches = result?.matchedDiseases || (result ? [{ name: result.matchedDisease, remedy: result.remedy }] : []);
  const totalScore = matches.reduce((total, disease) => total + (disease.score || 0), 0);
  const getProbability = (disease) => disease.probability ?? (
    totalScore ? Math.round((disease.score / totalScore) * 1000) / 10 : null
  );
  const attachedImageUrl = result?.imageUrl ? assetUrl(result.imageUrl) : imagePreviewUrl;
  return (
    <section className="page form-page">
      <div className="eyebrow">VrukshSaathi / NEW REPORT</div>
      <h1>Read the leaves.</h1>
      <p className="lede">Select what you can see. We will compare it with the disease library.</p>
      <form onSubmit={submit} className="report-form">
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
            {crops.map((crop) => <option key={crop}>{crop}</option>)}
          </select>
        </label>

        <fieldset>
          <legend>Visible symptoms</legend>
          <div className="symptom-grid">
            {symptoms.map((symptom) => (
              <label className={selected.includes(symptom) ? "symptom selected" : "symptom"} key={symptom}>
                <input type="checkbox" checked={selected.includes(symptom)} onChange={() => toggle(symptom)} />
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
        <button className="primary-button" type="submit">Analyze crop ↗</button>
      </form>
      {result && (
        <div className="result-box">
          <div className="eyebrow">
            {matches.length > 1 ? "POSSIBLE MATCHES" : "MATCH FOUND"}
          </div>
          <p className="result-note">Relative match probability based on the symptoms selected.</p>
          {attachedImageUrl && <img className="report-image" src={attachedImageUrl} alt="Attached crop" />}
          {matches.map((disease) => (
            <button className="result-match result-match-button" type="button" key={disease.name} onClick={() => setSelectedMatch(disease)}>
              <div className="result-heading">
                <h2>{disease.name}</h2>
                {getProbability(disease) !== null && <strong>{getProbability(disease)}%</strong>}
              </div>
              <p>{disease.remedy}</p>
              <span className="match-action">View details ↗</span>
            </button>
          ))}
          <button className="text-button" onClick={onComplete}>View report history →</button>
        </div>
      )}
      {selectedMatch && (
        <div className="overlay" role="presentation" onClick={() => setSelectedMatch(null)}>
          <div className="match-modal" role="dialog" aria-modal="true" aria-labelledby="match-title" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelectedMatch(null)} aria-label="Close disease details">×</button>
            {attachedImageUrl ? (
              <img className="modal-image" src={attachedImageUrl} alt="Attached crop" />
            ) : (
              <div className="modal-image-placeholder">No crop image attached</div>
            )}
            <div className="eyebrow">DISEASE MATCH</div>
            <div className="modal-heading">
              <h2 id="match-title">{selectedMatch.name}</h2>
              {getProbability(selectedMatch) !== null && <strong>{getProbability(selectedMatch)}%</strong>}
            </div>
            <div className="modal-recommendation">
              <div className="eyebrow">RECOMMENDATION</div>
              <p>{selectedMatch.remedy || "No recommendation available."}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
export default ReportForm;
