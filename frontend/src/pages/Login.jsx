import { useState } from "react";
import { authApi } from "../api.js";
function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const session = mode === "login" ? await authApi.login(form) : await authApi.register(form);
      onLogin(session);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "The account request could not be completed.");
    }
  };
  return <section className="page login-page"><div className="eyebrow">FIELDNOTE / ACCOUNT</div><h1>{mode === "login" ? "Welcome back." : "Start observing."}</h1><p className="lede">{mode === "login" ? "Sign in to keep your observations close." : "Create an account to keep your field history close."}</p><form className="login-form" onSubmit={submit}>{mode === "register" && <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>}<label>Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Password<input type="password" minLength="6" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">{mode === "login" ? "Sign in ↗" : "Create account ↗"}</button></form><button className="text-button account-switch" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Need an account? Create one →" : "Already have an account? Sign in →"}</button></section>;
}
export default Login;
