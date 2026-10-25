import { useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Image, Plus, Send, X } from "lucide-react";
import Avatar from "./Avatar.jsx";

export default function StatusViewer({ stories, currentStoryIndex, onClose, onAddStory, onReplyStory }) {
  const [index, setIndex] = useState(currentStoryIndex || 0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newImage, setNewImage] = useState("");

  const current = stories[index];

  useEffect(() => {
    if (!current || isPaused || showAddModal) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (index < stories.length - 1) {
            setIndex((i) => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [index, current, isPaused, stories.length, onClose, showAddModal]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (index > 0) {
      setIndex(index - 1);
      setProgress(0);
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (index < stories.length - 1) {
      setIndex(index + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplyStory(current, replyText.trim());
    setReplyText("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStatus = (e) => {
    e.preventDefault();
    if (!newImage) return;
    onAddStory({
      id: "story-" + Date.now(),
      userName: "Alex Morgan (You)",
      userAvatar: null,
      color: "#9088e8",
      timestamp: "Just now",
      seen: false,
      mediaUrl: newImage,
      caption: newCaption || "My status update ✨"
    });
    setShowAddModal(false);
    setNewImage("");
    setNewCaption("");
  };

  return (
    <div className="status-overlay" onClick={() => !showAddModal && onClose()}>
      {showAddModal ? (
        <div className="status-add-card" onClick={(e) => e.stopPropagation()}>
          <div className="status-add-head">
            <h3>Add to My Status</h3>
            <button className="icon-button" onClick={() => setShowAddModal(false)}><X size={18} /></button>
          </div>
          <form onSubmit={handleCreateStatus} className="status-add-form">
            <div className="status-preview-box">
              {newImage ? (
                <img src={newImage} alt="Status preview" />
              ) : (
                <label className="upload-placeholder">
                  <Image size={32} />
                  <span>Choose a photo for your status</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} required />
                </label>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Add a caption..." 
              value={newCaption} 
              onChange={(e) => setNewCaption(e.target.value)}
              className="status-caption-input"
            />
            <button type="submit" className="primary-button" disabled={!newImage}>
              Share Status (24 hours)
            </button>
          </form>
        </div>
      ) : (
        <div 
          className="status-content" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Progress indicators for each story */}
          <div className="status-bars">
            {stories.map((s, i) => (
              <div key={s.id} className="status-bar-bg">
                <div 
                  className="status-bar-fill" 
                  style={{ 
                    width: i < index ? "100%" : i === index ? `${progress}%` : "0%" 
                  }} 
                />
              </div>
            ))}
          </div>

          {/* Story header */}
          <div className="status-user-row">
            <Avatar name={current?.userName} color={current?.color} photo={current?.userAvatar} small />
            <div className="status-user-meta">
              <strong>{current?.userName}</strong>
              <small>{current?.timestamp}</small>
            </div>
            <div className="status-actions">
              <button 
                type="button" 
                className="icon-button" 
                onClick={() => setShowAddModal(true)} 
                title="Add your own status"
              >
                <Plus size={18} />
              </button>
              <button 
                type="button" 
                className="icon-button" 
                onClick={onClose} 
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Media image */}
          <div className="status-media-view">
            <img src={current?.mediaUrl} alt={current?.caption} />
            <button className="status-nav-btn prev" onClick={handlePrev}><ChevronLeft size={24} /></button>
            <button className="status-nav-btn next" onClick={handleNext}><ChevronRight size={24} /></button>
          </div>

          {/* Caption */}
          {current?.caption && (
            <div className="status-caption">
              <p>{current.caption}</p>
            </div>
          )}

          {/* Reply input */}
          <form className="status-reply-bar" onSubmit={handleSendReply}>
            <input 
              type="text" 
              placeholder={`Reply to ${current?.userName?.split(" ")[0]}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button type="submit" disabled={!replyText.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
