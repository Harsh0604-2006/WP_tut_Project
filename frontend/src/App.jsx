import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import History from "./pages/History.jsx";
import Login from "./pages/Login.jsx";
import ReportForm from "./pages/ReportForm.jsx";

function App() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("crop-dashboard-user") || "null"));

  const handleLogin = (session) => {
    localStorage.setItem("crop-dashboard-token", session.token);
    localStorage.setItem("crop-dashboard-user", JSON.stringify(session.user));
    setUser(session.user);
    setPage("dashboard");
  };

  const logout = () => {
    localStorage.removeItem("crop-dashboard-token");
    localStorage.removeItem("crop-dashboard-user");
    setUser(null);
    setPage("dashboard");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setPage("dashboard")}>Fieldnote <span>/ crop health</span></button>
        <nav>
          <button className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}>Overview</button>
          <button className={page === "report" ? "active" : ""} onClick={() => setPage("report")}>New report</button>
          <button className={page === "history" ? "active" : ""} onClick={() => setPage("history")}>History</button>
        </nav>
        {user ? <button className="user-chip" onClick={logout}>{user.name} · sign out</button> : <button className="login-link" onClick={() => setPage("login")}>Sign in</button>}
      </header>
      <main>
        {page === "dashboard" && <Dashboard onNewReport={() => setPage("report")} />}
        {page === "report" && <ReportForm onComplete={() => setPage("history")} />}
        {page === "history" && <History />}
        {page === "login" && <Login onLogin={handleLogin} />}
      </main>
    </div>
  );
}

export default App;
