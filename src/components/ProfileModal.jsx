import { useRef, useState } from "react";
import { Camera, Check, Copy, Globe, Lock, Mail, Phone, QrCode, Shield, Sparkles, User, X } from "lucide-react";
import Avatar from "./Avatar.jsx";
import { statusPresets } from "../data.js";

export default function ProfileModal({ user, onUpdateUser, onClose, onSignOut }) {
  const [formData, setFormData] = useState({
    name: user?.name || "Alex Morgan",
    username: user?.username || "alexm",
    phone: user?.phone || "+91 98765 43210",
    email: user?.email || "alex.morgan@example.com",
    bio: user?.bio || "Digital creator & explorer 📸 Living one photo at a time.",
    status: user?.status || "Hey there! I am using Blinker-a.",
    statusEmoji: user?.statusEmoji || "✨",
    avatarUrl: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    coverUrl: user?.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    discoverableByPhone: user?.discoverableByPhone ?? true,
    lastSeenPrivacy: user?.lastSeenPrivacy || "everyone",
    readReceipts: user?.readReceipts ?? true
  });

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "status" | "qr"
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, coverUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectStatus = (preset) => {
    setFormData((prev) => ({
      ...prev,
      status: preset.text,
      statusEmoji: preset.emoji
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const copyProfileLink = () => {
    navigator.clipboard?.writeText(`https://blinker.app/u/${formData.username || "me"}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal profile-modal">
        {/* Profile Modal Header */}
        <div className="profile-modal-top">
          <div className="modal-header">
            <div>
              <span className="eyebrow">MY ACCOUNT</span>
              <h2>User Profile</h2>
            </div>
            <button className="icon-button" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="profile-tabs">
            <button 
              className={activeTab === "profile" ? "active" : ""} 
              onClick={() => setActiveTab("profile")}
            >
              <User size={15} /> Edit Profile
            </button>
            <button 
              className={activeTab === "status" ? "active" : ""} 
              onClick={() => setActiveTab("status")}
            >
              <Sparkles size={15} /> Status / About
            </button>
            <button 
              className={activeTab === "qr" ? "active" : ""} 
              onClick={() => setActiveTab("qr")}
            >
              <QrCode size={15} /> Share QR
            </button>
          </div>
        </div>

        {activeTab === "profile" && (
          <form onSubmit={handleSubmit} className="profile-edit-body">
            {/* Header banner with cover image */}
            <div 
              className="profile-cover"
              style={{ backgroundImage: `url(${formData.coverUrl})` }}
            >
              <input 
                type="file" 
                ref={coverInputRef} 
                accept="image/*" 
                onChange={handleCoverFile} 
                style={{ display: "none" }} 
              />
              <button 
                type="button" 
                className="cover-edit-btn"
                onClick={() => coverInputRef.current?.click()}
                title="Change cover photo"
              >
                <Camera size={14} /> Change Cover
              </button>

              {/* Avatar circle overlapping the cover */}
              <div className="profile-avatar-wrapper">
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  accept="image/*" 
                  onChange={handleAvatarFile} 
                  style={{ display: "none" }} 
                />
                <div className="profile-avatar-large">
                  <Avatar name={formData.name} photo={formData.avatarUrl} color="#9088e8" />
                  <button 
                    type="button" 
                    className="avatar-edit-overlay"
                    onClick={() => avatarInputRef.current?.click()}
                    title="Change profile picture"
                  >
                    <Camera size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-fields">
              <div className="field-group">
                <label>Display Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="Your Name"
                  required 
                />
              </div>

              <div className="field-group">
                <label>Username (Telegram handle)</label>
                <div className="input-with-prefix">
                  <span>@</span>
                  <input 
                    type="text" 
                    value={formData.username} 
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })} 
                    placeholder="username" 
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Bio (About you)</label>
                <textarea 
                  rows={2} 
                  value={formData.bio} 
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                  placeholder="Tell people about yourself..."
                  maxLength={160}
                />
                <small className="char-count">{formData.bio.length}/160</small>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label><Phone size={13} /> Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    placeholder="+91 98765 43210" 
                  />
                </div>
                <div className="field-group">
                  <label><Mail size={13} /> Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="you@domain.com" 
                  />
                </div>
              </div>

              <div className="profile-privacy-box">
                <div className="section-label">PRIVACY & DISCOVERY</div>
                <label className="setting-row">
                  <span>Allow contacts to discover me by phone number</span>
                  <input 
                    type="checkbox" 
                    checked={formData.discoverableByPhone} 
                    onChange={(e) => setFormData({ ...formData, discoverableByPhone: e.target.checked })} 
                  />
                </label>
                <label className="setting-row">
                  <span>Send Read Receipts (Blue double ticks)</span>
                  <input 
                    type="checkbox" 
                    checked={formData.readReceipts} 
                    onChange={(e) => setFormData({ ...formData, readReceipts: e.target.checked })} 
                  />
                </label>
              </div>
            </div>

            <div className="modal-footer">
              {savedNotice ? (
                <span className="saved-badge"><Check size={14} /> Profile Saved Successfully!</span>
              ) : (
                <button type="button" className="text-button danger" onClick={onSignOut}>Sign Out</button>
              )}
              <button type="submit" className="primary-button">
                Save Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === "status" && (
          <div className="profile-status-body">
            <div className="current-status-banner">
              <span className="status-large-emoji">{formData.statusEmoji || "✨"}</span>
              <div className="status-banner-text">
                <span className="eyebrow">CURRENT ABOUT STATUS</span>
                <strong>{formData.status}</strong>
              </div>
            </div>

            <div className="custom-status-input-wrap">
              <label>Custom Status</label>
              <div className="custom-status-row">
                <input 
                  type="text" 
                  className="emoji-input"
                  value={formData.statusEmoji} 
                  onChange={(e) => setFormData({ ...formData, statusEmoji: e.target.value.slice(0, 2) })} 
                  placeholder="✨" 
                />
                <input 
                  type="text" 
                  className="text-input"
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                  placeholder="Set a custom status message..." 
                />
              </div>
            </div>

            <div className="section-label">CHOOSE PRESET STATUS (WHATSAPP & TELEGRAM)</div>
            <div className="status-presets-grid">
              {statusPresets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  className={`status-chip ${formData.status === preset.text ? "active" : ""}`}
                  onClick={() => handleSelectStatus(preset)}
                >
                  <span className="chip-emoji">{preset.emoji}</span>
                  <span className="chip-text">{preset.text}</span>
                  {formData.status === preset.text && <Check size={14} className="chip-check" />}
                </button>
              ))}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="primary-button" 
                onClick={() => {
                  onUpdateUser(formData);
                  setSavedNotice(true);
                  setTimeout(() => setSavedNotice(false), 2000);
                }}
              >
                {savedNotice ? "Status Updated!" : "Update Status"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "qr" && (
          <div className="profile-qr-body">
            <div className="qr-card">
              <div className="qr-avatar-badge">
                <Avatar name={formData.name} photo={formData.avatarUrl} color="#9088e8" />
              </div>
              <h3>{formData.name}</h3>
              <p>@{formData.username}</p>

              {/* Styled Telegram/WhatsApp QR visual */}
              <div className="qr-code-box">
                <svg viewBox="0 0 100 100" width="160" height="160" className="qr-svg">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="28" height="28" rx="6" fill="#84a9ff" />
                  <rect x="9" y="9" width="20" height="20" rx="4" fill="#0d1118" />
                  <rect x="13" y="13" width="12" height="12" rx="2" fill="#84a9ff" />

                  <rect x="67" y="5" width="28" height="28" rx="6" fill="#84a9ff" />
                  <rect x="71" y="9" width="20" height="20" rx="4" fill="#0d1118" />
                  <rect x="75" y="13" width="12" height="12" rx="2" fill="#84a9ff" />

                  <rect x="5" y="67" width="28" height="28" rx="6" fill="#84a9ff" />
                  <rect x="9" y="71" width="20" height="20" rx="4" fill="#0d1118" />
                  <rect x="13" y="75" width="12" height="12" rx="2" fill="#84a9ff" />

                  {/* QR Pattern dots */}
                  <circle cx="45" cy="18" r="3" fill="#84a9ff" />
                  <circle cx="55" cy="22" r="3" fill="#84a9ff" />
                  <circle cx="48" cy="35" r="3" fill="#84a9ff" />
                  <circle cx="20" cy="48" r="3" fill="#84a9ff" />
                  <circle cx="35" cy="52" r="3" fill="#84a9ff" />
                  <circle cx="50" cy="50" r="5" fill="#65d4a7" />
                  <circle cx="65" cy="48" r="3" fill="#84a9ff" />
                  <circle cx="80" cy="52" r="3" fill="#84a9ff" />
                  <circle cx="45" cy="65" r="3" fill="#84a9ff" />
                  <circle cx="60" cy="72" r="3" fill="#84a9ff" />
                  <circle cx="75" cy="68" r="3" fill="#84a9ff" />
                  <circle cx="52" cy="82" r="3" fill="#84a9ff" />
                  <circle cx="82" cy="85" r="3" fill="#84a9ff" />
                </svg>
                <div className="qr-center-logo">
                  <span>b.</span>
                </div>
              </div>

              <p className="qr-caption">Scan this QR code with any camera to start chatting on Blinker-a.</p>

              <div className="qr-actions">
                <button type="button" className="primary-button" onClick={copyProfileLink}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Link Copied!" : "Copy Profile Link"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
