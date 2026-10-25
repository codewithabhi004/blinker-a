import { useRef } from "react";
import { Check, Image, RefreshCw, Sliders, Upload, X } from "lucide-react";
import { wallpaperPresets } from "../data.js";

export default function WallpaperModal({ wallpaperConfig, onSave, onClose }) {
  const fileInputRef = useRef(null);

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onSave({
          ...wallpaperConfig,
          type: "custom",
          id: "custom-" + Date.now(),
          name: file.name,
          bg: `url("${reader.result}")`,
          customUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset) => {
    onSave({
      ...wallpaperConfig,
      type: "preset",
      id: preset.id,
      name: preset.name,
      bg: preset.bg,
      pattern: preset.pattern
    });
  };

  const handleDimChange = (dim) => {
    onSave({
      ...wallpaperConfig,
      dim: Number(dim)
    });
  };

  const handleBlurChange = (blur) => {
    onSave({
      ...wallpaperConfig,
      blur: Number(blur)
    });
  };

  const handleReset = () => {
    onSave({
      type: "preset",
      id: "aurora",
      name: "Telegram Aurora",
      bg: "radial-gradient(ellipse at 45% -20%, rgba(112, 91, 187, .25), transparent 60%), radial-gradient(ellipse at 95% 70%, rgba(60, 122, 168, .2), transparent 50%), #0d1118",
      dim: 25,
      blur: 0
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal wallpaper-modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">WHATSAPP & TELEGRAM THEME</span>
            <h2>Chat Wallpaper</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Live Wallpaper Preview Card */}
        <div className="wallpaper-preview-hero">
          <div 
            className="wallpaper-preview-bg"
            style={{
              background: wallpaperConfig.bg || "#0d1118",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `blur(${wallpaperConfig.blur || 0}px)`
            }}
          >
            {wallpaperConfig.pattern === "doodle" && <div className="doodle-pattern-overlay" />}
            {wallpaperConfig.pattern === "dots" && <div className="dots-pattern-overlay" />}
            <div 
              className="wallpaper-dim-layer" 
              style={{ backgroundColor: `rgba(0, 0, 0, ${(wallpaperConfig.dim ?? 20) / 100})` }}
            />
          </div>

          <div className="wallpaper-mock-bubbles">
            <div className="mock-bubble incoming">
              <span>Hey! How does this wallpaper look? 🎨</span>
              <time>10:42</time>
            </div>
            <div className="mock-bubble outgoing">
              <span>Looks super clean and modern, just like WhatsApp! 👌</span>
              <time>10:43</time>
            </div>
          </div>
        </div>

        {/* Custom Image Upload Button */}
        <div className="wallpaper-upload-section">
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleCustomUpload} 
            style={{ display: "none" }} 
          />
          <button 
            type="button" 
            className="wallpaper-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} />
            <div>
              <strong>Choose from Device Gallery / Photos</strong>
              <small>Upload your own photo as chat background</small>
            </div>
          </button>
        </div>

        {/* Sliders for WhatsApp-style Wallpaper Dimming and Blur */}
        <div className="wallpaper-adjustments">
          <div className="slider-row">
            <div className="slider-label">
              <span><Sliders size={14} /> Wallpaper Dimming</span>
              <strong>{wallpaperConfig.dim ?? 20}%</strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="80" 
              value={wallpaperConfig.dim ?? 20} 
              onChange={(e) => handleDimChange(e.target.value)} 
              className="range-slider"
            />
          </div>

          <div className="slider-row">
            <div className="slider-label">
              <span>Subtle Blur</span>
              <strong>{wallpaperConfig.blur ?? 0}px</strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="12" 
              value={wallpaperConfig.blur ?? 0} 
              onChange={(e) => handleBlurChange(e.target.value)} 
              className="range-slider"
            />
          </div>
        </div>

        {/* Curated Wallpaper Presets */}
        <div className="wallpaper-presets-list">
          <div className="section-label">CURATED WALLPAPERS</div>
          <div className="wallpaper-grid">
            {wallpaperPresets.map((preset) => {
              const isSelected = wallpaperConfig.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`wallpaper-tile ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <div 
                    className="tile-preview" 
                    style={{ 
                      background: preset.preview,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }} 
                  >
                    {preset.pattern === "doodle" && <div className="doodle-pattern-overlay" />}
                    {isSelected && (
                      <div className="tile-check">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="text-button" onClick={handleReset}>
            <RefreshCw size={13} /> Reset to Default
          </button>
          <button type="button" className="primary-button" onClick={onClose}>
            Apply Wallpaper
          </button>
        </div>
      </div>
    </div>
  );
}
