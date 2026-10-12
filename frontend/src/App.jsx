import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import History from "./pages/History.jsx";
import Login from "./pages/Login.jsx";
import ReportForm from "./pages/ReportForm.jsx";

function App() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("crop-dashboard-user") || "null")
  );
  const isAuthenticated = Boolean(user);
  const activePage = isAuthenticated ? page : "login";

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
    setPage("login");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => isAuthenticated && setPage("dashboard")}>
          VrukshSaathi <span>/ crop health</span>
        </button>
        {isAuthenticated && (
          <nav>
            <button
              className={activePage === "dashboard" ? "active" : ""}
              onClick={() => setPage("dashboard")}
            >
              Overview
            </button>
            <button
              className={activePage === "report" ? "active" : ""}
              onClick={() => setPage("report")}
            >
              New report
            </button>
            <button
              className={activePage === "history" ? "active" : ""}
              onClick={() => setPage("history")}
            >
              History
            </button>
          </nav>
        )}
        {user ? (
          <button className="user-chip" onClick={logout}>
            {user.name} · sign out
          </button>
        ) : (
          <button className="login-link" onClick={() => setPage("login")}>
            Sign in
          </button>
        )}
      </header>
      <main>
        {!isAuthenticated && <Login onLogin={handleLogin} />}
        {isAuthenticated && activePage === "dashboard" && (
          <Dashboard onNewReport={() => setPage("report")} />
        )}
        {isAuthenticated && activePage === "report" && (
          <ReportForm onComplete={() => setPage("history")} />
        )}
        {isAuthenticated && activePage === "history" && <History />}
      </main>
    </div>
  );
}

export default App;
