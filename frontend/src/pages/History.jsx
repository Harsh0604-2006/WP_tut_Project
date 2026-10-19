import { useEffect, useState } from "react";
import { assetUrl, reportsApi } from "../api.js";
function History() {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    reportsApi
      .list()
      .then(setReports)
      .catch(() => setReports([]));
  }, []);
  const getProbability = (report, disease) => {
    if (disease.probability !== undefined) return disease.probability;
    const totalScore = report.matchedDiseases?.reduce((total, match) => total + (match.score || 0), 0);
    return totalScore ? Math.round((disease.score / totalScore) * 1000) / 10 : null;
  };

  return (
    <section className="page">
      <div className="eyebrow">VrukshSaathi / 03</div>
      <h1>Field history.</h1>
      <p className="lede">Every observation, kept in one place.</p>

      <div className="history-list">
        {reports.length ? (
          reports.map((report) => (
            <article className="history-row" key={report._id}>
              <div>
                <span>{new Date(report.date).toLocaleDateString()}</span>
                <h2>{report.cropType}</h2>
                {report.imageUrl && <img className="history-image" src={assetUrl(report.imageUrl)} alt="Attached crop" />}
              </div>
              <div>
                {report.matchedDiseases?.length ? report.matchedDiseases.map((disease) => (
                  <div className="history-disease" key={disease.name}>
                    <strong>{disease.name}</strong>
                    {getProbability(report, disease) !== null && <span>{getProbability(report, disease)}%</span>}
                  </div>
                )) : <strong>{report.matchedDisease}</strong>}
                <p>{report.symptoms.join(" · ")}</p>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            No saved reports yet. Your next observation belongs here.
          </div>
        )}
      </div>
    </section>
  );
}
export default History;
