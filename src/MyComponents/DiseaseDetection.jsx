import { useState } from "react";
import cropDiseaseData from "./cropdisease.json";

function DiseaseDetection() {
    const [crop, setCrop] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const analyzeCrop = () => {
        if (!crop) {
            setResult(null);
            setError("Please select a crop first.");
            return;
        }

        const disease = cropDiseaseData.find((item) => item.crop === crop);

        setResult(disease);
        setError(disease ? "" : "No disease data found for this crop.");
    };

    return (
        <div>
            <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
            >
                <option value="">Select Crop</option>
                <option value="Tomato">Tomato</option>
                <option value="Potato">Potato</option>
            </select>

            <button onClick={analyzeCrop}>
                Analyze Crop
            </button>

            {error && <p>{error}</p>}

            {result && (
                <div>
                    <h2>{result.disease}</h2>
                    <p>Confidence: {result.confidence}%</p>
                    <p>Severity: {result.severity}</p>
                    <p>Treatment: {result.treatment}</p>
                    <p>Prevention: {result.prevention}</p>
                </div>
            )}
        </div>
    );
}

export default DiseaseDetection;