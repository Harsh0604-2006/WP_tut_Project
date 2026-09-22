import { useEffect, useState } from "react";
import { reportsApi } from "../api.js";
function History() {
  const [reports, setReports] = useState([]);
  useEffect(() => { reportsApi.list().then(setReports).catch(() => setReports([])); }, []);
  return <section className="page"><div className="eyebrow">FIELDNOTE / 03</div><h1>Field history.</h1><p className="lede">Every observation, kept in one place.</p><div className="history-list">{reports.length ? reports.map((report) => <article className="history-row" key={report._id}><div><span>{new Date(report.date).toLocaleDateString()}</span><h2>{report.cropType}</h2></div><div><strong>{report.matchedDisease}</strong><p>{report.symptoms.join(" · ")}</p></div></article>) : <div className="empty-state">No saved reports yet. Your next observation belongs here.</div>}</div></section>;
}
export default History;
