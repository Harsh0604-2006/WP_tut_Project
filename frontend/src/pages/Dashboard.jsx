import { useEffect, useState } from "react";
import { reportsApi } from "../api.js";

const fallbackStats = { totalReports: 12, cropsScanned: 4, diseaseCounts: { "Early Blight": 7, "Late Blight": 3, "Powdery Mildew": 2 } };

function Dashboard({ onNewReport }) {
  const [stats, setStats] = useState(fallbackStats);
  useEffect(() => { reportsApi.stats().then(setStats).catch(() => {}); }, []);
  const topDisease = Object.entries(stats.diseaseCounts)[0];

  return <section className="page dashboard-page">
    <div className="eyebrow">FIELDNOTE / 01</div>
    <div className="hero-row"><div><h1>Keep an eye<br /><em>on the green.</em></h1><p className="lede">A calm, practical record of what your crops are telling you.</p></div><button className="primary-button" onClick={onNewReport}>+ Start a report</button></div>
    <div className="stats-grid"><article><span>Reports filed</span><strong>{stats.totalReports}</strong><small>Across your growing season</small></article><article><span>Crops scanned</span><strong>{stats.cropsScanned}</strong><small>Different crop varieties</small></article><article className="accent-card"><span>Most common signal</span><strong>{topDisease?.[0] || "No data yet"}</strong><small>{topDisease ? `${topDisease[1]} observations` : "File your first report"}</small></article></div>
    <div className="section-heading"><div><div className="eyebrow">RECENT PATTERNS</div><h2>What the field has been saying</h2></div><button className="text-button" onClick={onNewReport}>Log an observation →</button></div>
    <div className="pattern-list">{Object.entries(stats.diseaseCounts).map(([name, count], index) => <div className="pattern-row" key={name}><span className="pattern-index">0{index + 1}</span><span className="pattern-name">{name}</span><span className="pattern-bar"><i style={{ width: `${Math.min(count * 12, 100)}%` }} /></span><strong>{count}</strong></div>)}</div>
  </section>;
}
export default Dashboard;
