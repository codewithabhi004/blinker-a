import { Download, X } from "lucide-react";

export default function ImageViewerModal({ src, alt, caption, onClose }) {
  if (!src) return null;

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-bar" onClick={(e) => e.stopPropagation()}>
        <span className="image-viewer-title">{alt || "Shared image"}</span>
        <div className="image-viewer-tools">
          <a href={src} download="blinker-image.jpg" className="icon-button" title="Download">
            <Download size={18} />
          </a>
          <button className="icon-button" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="image-viewer-container" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt || "View"} className="image-viewer-img" />
        {caption && (
          <div className="image-viewer-caption">
            <p>{caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
