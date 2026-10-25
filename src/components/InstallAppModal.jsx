import { useState } from "react";
import { Check, Copy, Download, QrCode, Share2, Smartphone, X } from "lucide-react";

export default function InstallAppModal({ installPrompt, onTriggerInstall, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareLink = window.location.href;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Namaste! Install Blinker-a — India ka apna real-time messenger with WhatsApp & Telegram features. Download & Chat here: ${shareLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal install-modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">ANDROID & MOBILE APP</span>
            <h2>Install / Download Blinker-a</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="install-modal-body">
          {/* Hero Banner */}
          <div className="install-hero-card">
            <div className="install-hero-icon">
              <Smartphone size={32} />
            </div>
            <div className="install-hero-text">
              <h3>Blinker-a for Android</h3>
              <p>Works like a real Android app with offline chat, voice notes, calls and instant notifications.</p>
            </div>
          </div>

          {/* 1-Click Install Button if supported or guided */}
          <div className="install-actions-box">
            {installPrompt ? (
              <button
                type="button"
                className="primary-button install-main-btn"
                onClick={onTriggerInstall}
              >
                <Download size={18} />
                <span>Install Directly on Android Phone</span>
              </button>
            ) : (
              <div className="install-guide-box">
                <strong>📱 How to Install on Android / Phone:</strong>
                <ol>
                  <li>Tap the browser menu (<strong>⋮</strong> or three dots at top-right).</li>
                  <li>Select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.</li>
                  <li>Blinker-a icon will appear on your phone's app drawer!</li>
                </ol>
              </div>
            )}
          </div>

          {/* Share with Contacts */}
          <div className="section-label">SHARE WITH INDIAN CONTACTS</div>
          <p className="install-subtext">Share this link with your friends and family so they can download the app and start chatting with you.</p>

          <div className="install-share-grid">
            <button
              type="button"
              className="share-whatsapp-btn"
              onClick={handleWhatsAppShare}
            >
              <span>Share on WhatsApp</span>
            </button>

            <button
              type="button"
              className="share-copy-btn"
              onClick={handleCopy}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>
          </div>

          {/* Developer Android APK Info */}
          <div className="apk-info-box">
            <span className="apk-badge">APK BUILD READY</span>
            <p>Android Studio & Capacitor project is in <code>/android</code>. You can build a release APK using <code>./gradlew assembleDebug</code> or GitHub Actions.</p>
          </div>
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
