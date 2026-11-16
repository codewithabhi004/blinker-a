import { useState } from "react";
import { Check, Copy, Download, Smartphone, X } from "lucide-react";
import { APK_DOWNLOAD_URL } from "../api.js";

export default function InstallAppModal({ onClose }) {
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
          <div className="install-hero-card">
            <div className="install-hero-icon">
              <Smartphone size={32} />
            </div>
            <div className="install-hero-text">
              <h3>Blinker-a for Android</h3>
              <p>Download the Android APK to install the native app. This is not a home-screen shortcut.</p>
            </div>
          </div>

          <div className="install-actions-box">
            <a className="primary-button install-main-btn" href={APK_DOWNLOAD_URL}>
              <Download size={18} />
              <span>Download Android APK</span>
            </a>
            <div className="install-guide-box">
              <strong>Install the downloaded app</strong>
              <ol>
                <li>Open the downloaded <code>blinker-a.apk</code> file on your Android phone.</li>
                <li>If Android asks, allow your browser to install unknown apps, then confirm Install.</li>
                <li>Open Blinker-a from the app drawer and sign in.</li>
              </ol>
              <small className="install-note">This test APK is sideloaded, not installed from Google Play. A new debug build may require uninstalling the previous build first.</small>
            </div>
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

          <div className="apk-info-box">
            <span className="apk-badge">ANDROID APK RELEASE</span>
            <p>The download link is available after the first tagged Android release has completed in GitHub Actions.</p>
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
