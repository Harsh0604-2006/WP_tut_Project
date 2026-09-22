import { useState } from "react";
import { reportsApi } from "../api.js";

const symptoms = ["Yellow Leaves", "Brown Spots", "Leaf Curling", "Wilting", "Powdery Coating"];
function ReportForm({ onComplete }) {
  const [cropType, setCropType] = useState("Tomato");
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const toggle = (symptom) => setSelected((current) => current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]);
  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (!selected.length) return setError("Choose at least one visible symptom.");
    try {
      setResult(await reportsApi.create({ cropType, symptoms: selected }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "The report could not be saved. Check that the backend is running.");
    }
  };
  return <section className="page form-page"><div className="eyebrow">FIELDNOTE / NEW REPORT</div><h1>Read the leaves.</h1><p className="lede">Select what you can see. We will compare it with the disease library.</p><form onSubmit={submit} className="report-form"><label>Crop<select value={cropType} onChange={(event) => setCropType(event.target.value)}><option>Tomato</option><option>Potato</option><option>Cucumber</option></select></label><fieldset><legend>Visible symptoms</legend><div className="symptom-grid">{symptoms.map((symptom) => <label className={selected.includes(symptom) ? "symptom selected" : "symptom"} key={symptom}><input type="checkbox" checked={selected.includes(symptom)} onChange={() => toggle(symptom)} />{symptom}</label>)}</div></fieldset>{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">Analyze crop ↗</button></form>{result && <div className="result-box"><div className="eyebrow">MATCH FOUND</div><h2>{result.matchedDisease}</h2><p>{result.remedy}</p><button className="text-button" onClick={onComplete}>View report history →</button></div>}</section>;
}
export default ReportForm;
