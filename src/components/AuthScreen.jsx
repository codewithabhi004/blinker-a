import { useEffect, useState } from "react";
import { AtSign, LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";
import { apiRequest, APK_DOWNLOAD_URL } from "../api.js";
import "./AuthScreen.css";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/health").then(() => {
      if (!cancelled) setApiStatus("ready");
    }).catch(() => {
      if (!cancelled) setApiStatus("unavailable");
    });
    return () => { cancelled = true; };
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = mode === "login"
        ? await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ identifier, password })
        })
        : await apiRequest("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({ username, password })
        });
      onAuthenticated(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  function normalizeUsername(value) {
    return value.replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 32);
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <div className="auth-brand-icon"><MessageCircle size={25} /></div>
          <span>Blinker-a</span>
        </div>
        <p className="eyebrow">PRIVATE MESSAGING</p>
        <h1 id="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-description">
          {mode === "login"
            ? "Sign in with your username or an existing verified phone account."
            : "Create a username and password. No phone number or SMS is needed."}
        </p>

        <div className="auth-mode-tabs" role="tablist" aria-label="Account action">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Sign in</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>Sign up</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "login" ? (
            <label>
              <span><AtSign size={14} /> Username or phone number</span>
              <input
                type="text"
                autoComplete="username"
                placeholder="@username or +919876543210"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
              <small>Use your username, or an international phone number for an existing verified account.</small>
            </label>
          ) : (
            <label>
              <span><AtSign size={14} /> Username</span>
              <input
                type="text"
                autoComplete="username"
                placeholder="your_username"
                pattern="[A-Za-z0-9_]{3,32}"
                minLength={3}
                maxLength={32}
                value={username}
                onChange={(event) => setUsername(normalizeUsername(event.target.value))}
                required
              />
              <small>3–32 letters, numbers, or underscores. People can find you by this username.</small>
            </label>
          )}
          <label>
            <span><LockKeyhole size={14} /> Password</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={mode === "signup" ? 12 : undefined}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {mode === "signup" && <small>Use at least 12 characters.</small>}
            {mode === "signup" && <small>Password reset is not available yet, so save your password securely.</small>}
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {apiStatus === "checking" && <p className="auth-service-note">Connecting to the chat server…</p>}
          {apiStatus === "unavailable" && (
            <div className="auth-service-error" role="status">
              <span>The chat server is not ready yet. Your credentials will not be sent.</span>
              <button type="button" onClick={() => {
                setApiStatus("checking");
                apiRequest("/api/health").then(() => setApiStatus("ready")).catch(() => setApiStatus("unavailable"));
              }}>Try again</button>
            </div>
          )}
          <button className="primary-button auth-submit" type="submit" disabled={busy || apiStatus !== "ready"}>
            {busy ? "Please wait..." : mode === "login" ? "Sign in securely" : "Create account"}
          </button>
        </form>

        <div className="auth-privacy-note">
          <ShieldCheck size={17} />
          <span>Phone contact matching stays off until you verify a phone number. Find people by username instead.</span>
        </div>
        <a className="auth-download-link" href={APK_DOWNLOAD_URL}>
          <span>Want the real Android app?</span>
          <strong>Download APK</strong>
        </a>
        <small className="auth-download-note">The public APK link is activated after the first tagged Android release.</small>
      </section>
    </main>
  );
}
