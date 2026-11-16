import { useRef, useState } from "react";
import { Camera, Check, LogOut, Phone, X } from "lucide-react";
import Avatar from "./Avatar.jsx";

const MAX_AVATAR_LENGTH = 24_000;

function compressAvatar(file) {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      try {
        const longestSide = Math.min(256, Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("This device cannot process the selected photo.");

        for (let side = longestSide; side >= 64; side = Math.floor(side * 0.75)) {
          const scale = side / Math.max(image.naturalWidth, image.naturalHeight);
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          for (const quality of [0.8, 0.65, 0.5]) {
            const compressed = canvas.toDataURL("image/jpeg", quality);
            if (compressed.length <= MAX_AVATAR_LENGTH) {
              resolve(compressed);
              return;
            }
          }
        }
        reject(new Error("This photo could not be compressed enough. Choose a smaller image."));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(sourceUrl);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("The selected photo could not be opened."));
    };
    image.src = sourceUrl;
  });
}

export default function ProfileModal({ user, onUpdateUser, onClose, onSignOut }) {
  const [formData, setFormData] = useState({
    name: user?.name || "Alex Morgan",
    username: user?.username || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
    discoverableByPhone: user?.discoverableByPhone ?? false
  });

  const [savedNotice, setSavedNotice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [processingAvatar, setProcessingAvatar] = useState(false);

  const avatarInputRef = useRef(null);

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setAvatarError("Choose an image smaller than 10 MB.");
      return;
    }
    setAvatarError("");
    setProcessingAvatar(true);
    try {
      const avatarUrl = await compressAvatar(file);
      setFormData((previous) => ({ ...previous, avatarUrl }));
    } catch (error) {
      setAvatarError(error.message);
    } finally {
      setProcessingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const saved = await onUpdateUser(formData);
      if (!saved) return;
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
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

        </div>

        <form onSubmit={handleSubmit} className="profile-edit-body">
            {/* Header banner with cover image */}
            <div className="profile-cover">
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
            {avatarError && <p className="profile-image-error" role="alert">{avatarError}</p>}
            {saveError && <p className="profile-image-error" role="alert">{saveError}</p>}

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

              <div className="field-group">
                <label><Phone size={13} /> Verified phone number</label>
                <input type="tel" value={formData.phone} readOnly />
                <small className="char-count">Changing your verified number is not available yet.</small>
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
              </div>
            </div>

            <div className="modal-footer">
              {savedNotice ? (
                <span className="saved-badge"><Check size={14} /> Profile Saved Successfully!</span>
              ) : (
                <button type="button" className="text-button danger" onClick={onSignOut}>
                  <LogOut size={15} /> Sign Out
                </button>
              )}
              <button type="submit" className="primary-button" disabled={saving || processingAvatar}>
                {processingAvatar ? "Preparing photo..." : saving ? "Saving..." : <><Check size={16} /> Save Changes</>}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}
