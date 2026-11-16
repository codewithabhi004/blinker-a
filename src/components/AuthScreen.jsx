import { useEffect, useState } from "react";
import { LockKeyhole, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { apiRequest, APK_DOWNLOAD_URL } from "../api.js";
import "./AuthScreen.css";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("details");
  const [phone, setPhone] = useState("+91");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
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
      if (mode === "login") {
        const result = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ phone, password })
        });
        onAuthenticated(result);
      } else if (step === "details") {
        await apiRequest("/api/auth/request-otp", {
          method: "POST",
          body: JSON.stringify({ phone })
        });
        setStep("verify");
      } else {
        const result = await apiRequest("/api/auth/verify-otp", {
          method: "POST",
          body: JSON.stringify({ phone, name, password, code })
        });
        onAuthenticated(result);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setStep("details");
    setError("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <div className="auth-brand-icon"><MessageCircle size={25} /></div>
          <span>Blinker-a</span>
        </div>
        <p className="eyebrow">PRIVATE MESSAGING</p>
        <h1 id="auth-title">{mode === "login" ? "Welcome back" : step === "details" ? "Create your account" : "Verify your phone"}</h1>
        <p className="auth-description">
          {mode === "login"
            ? "Sign in to see your real conversations."
            : step === "details"
              ? "We will text you a one-time code to verify your number."
              : `Enter the six-digit code sent to ${phone}.`}
        </p>

        <div className="auth-mode-tabs" role="tablist" aria-label="Account action">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Sign in</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>Sign up</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && step === "details" && (
            <label>
              <span>Your name</span>
              <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required />
            </label>
          )}
          {mode === "signup" && step === "verify" && (
            <label>
              <span>SMS verification code</span>
              <input autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required />
            </label>
          )}
          {(mode === "login" || step === "details") && (
            <label>
              <span><Phone size={14} /> Phone number</span>
              <input type="tel" autoComplete="tel" inputMode="tel" placeholder="+919876543210" value={phone} onChange={(event) => setPhone(event.target.value)} required />
              <small>Include your country code, for example +91.</small>
            </label>
          )}
          {(mode === "login" || step === "details") && (
            <label>
              <span><LockKeyhole size={14} /> Password</span>
              <input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required />
              {mode === "signup" && <small>Use at least 12 characters.</small>}
            </label>
          )}
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
            {busy ? "Please wait..." : mode === "login" ? "Sign in securely" : step === "details" ? "Send verification code" : "Verify & create account"}
          </button>
          {mode === "signup" && step === "verify" && (
            <button type="button" className="auth-back" onClick={() => { setStep("details"); setError(""); }}>Change phone or details</button>
          )}
        </form>

        <div className="auth-privacy-note">
          <ShieldCheck size={17} />
          <span>Your phone number is only discoverable if you opt in to contact matching.</span>
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
