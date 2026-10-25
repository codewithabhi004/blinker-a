import { useState } from "react";
import { Check, ExternalLink, GitBranch, Github, KeyRound, Loader2, Sparkles, X } from "lucide-react";

export default function GitHubModal({ onClose, onSuccess }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const openGitHubLogin = () => {
    window.open("https://github.com/settings/tokens/new?scopes=repo&description=Blinker-a", "_blank");
  };

  const handlePush = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Push failed. Check your token permissions.");
      }

      setResult(data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal github-sync-modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">GITHUB INTEGRATION</span>
            <h2>Push to GitHub Repository</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="github-modal-body">
          {/* Target Repo Badge */}
          <div className="repo-badge-card">
            <Github size={24} />
            <div className="repo-badge-text">
              <strong>codewithabhi004/blinker-a</strong>
              <small>Target: Branch <code>main</code> · Free GitHub Pages</small>
            </div>
          </div>

          {result ? (
            <div className="github-success-card">
              <div className="success-icon-wrap">
                <Check size={28} />
              </div>
              <h3>Pushed to GitHub Successfully! 🎉</h3>
              <p>Aapke sare files aur commits GitHub par live update ho gaye hain.</p>

              <div className="success-links-box">
                <a
                  href="https://github.com/codewithabhi004/blinker-a"
                  target="_blank"
                  rel="noreferrer"
                  className="github-link-btn"
                >
                  <Github size={16} />
                  <span>View Repository on GitHub</span>
                  <ExternalLink size={14} />
                </a>

                <a
                  href="https://codewithabhi004.github.io/blinker-a/"
                  target="_blank"
                  rel="noreferrer"
                  className="github-pages-link-btn"
                >
                  <Sparkles size={16} />
                  <span>Open Live Website (github.io)</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              <small className="pages-note">
                Note: Agar GitHub Pages pehli baar deploy ho raha hai, toh GitHub par <b>Settings ➔ Pages ➔ Source: GitHub Actions</b> select karein. 1-2 minute me site live ho jayegi.
              </small>
            </div>
          ) : (
            <form onSubmit={handlePush} className="github-form">
              <div className="github-step-card">
                <strong>Step 1: GitHub Login & Token Page Open karein</strong>
                <p>Neeche button par click karein, GitHub khulega. "Generate token" par click karke token copy karein:</p>
                <button
                  type="button"
                  className="primary-button open-github-btn"
                  onClick={openGitHubLogin}
                >
                  <ExternalLink size={16} />
                  <span>Open GitHub Login / Token Page</span>
                </button>
              </div>

              <div className="github-step-card">
                <strong>Step 2: Token Paste karein</strong>
                <div className="token-input-wrap">
                  <KeyRound size={16} />
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="github-error-box">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="primary-button push-submit-btn"
                disabled={loading || !token.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Pushing to codewithabhi004/blinker-a...</span>
                  </>
                ) : (
                  <>
                    <GitBranch size={16} />
                    <span>Push to GitHub & Deploy .io</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="text-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
