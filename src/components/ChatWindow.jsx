import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Check, CheckCheck, ChevronDown, Download, FileText,
  Image as ImageIcon, MoreHorizontal, Pin, Search, ShieldCheck, Trash2, X
} from "lucide-react";
import Avatar from "./Avatar.jsx";
import MessageInput from "./MessageInput.jsx";
import VoiceNotePlayer from "./VoiceNotePlayer.jsx";

function MessageRow({
  message, chat, onReply, onEdit, onDelete, onForward, onPin, onImageClick, isHighlighted
}) {
  const mine = message.from === "me";
  const deleted = message.deleted;

  return (
    <motion.article
      className={`message-row ${mine ? "outgoing" : "incoming"} ${isHighlighted ? "highlighted" : ""}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {!mine && <Avatar name={message.sender || chat.name} color={chat.color} photo={chat.avatarUrl} small />}

      <div className="message-content">
        {message.sender && !mine && <span className="message-sender">{message.sender}</span>}
        {message.reply && <div className="quoted-message">{message.reply}</div>}

        <div className="message-bubble">
          {/* Image preview with click to view */}
          {message.fileUrl && (message.kind === "image" || (!message.kind && message.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)/i))) && (
            <div className="media-container" onClick={() => onImageClick(message.fileUrl, message.fileName || message.text)}>
              <img className="message-media" src={message.fileUrl} alt={message.fileName || "Shared photo"} />
              <span className="media-tap-hint">Tap to expand</span>
            </div>
          )}

          {message.fileUrl && message.kind === "video" && (
            <video className="message-media" src={message.fileUrl} controls />
          )}

          {/* Voice note message */}
          {message.kind === "audio" ? (
            <VoiceNotePlayer
              waveform={message.waveform}
              duration={message.voiceDuration || "0:18"}
              mine={mine}
            />
          ) : message.fileName && message.kind === "file" ? (
            <div className="file-preview">
              <FileText size={18} />
              <span>{message.fileName}</span>
            </div>
          ) : null}

          {/* Text content */}
          {message.text && message.kind !== "audio" && (
            <p>{deleted ? "This message was deleted" : message.text}</p>
          )}

          <div className="message-meta">
            <time>{message.time}</time>
            {message.edited && <span className="edited-label">edited</span>}
            {mine && (
              message.read ? (
                <CheckCheck className="read-tick blue-ticks" size={15} />
              ) : message.delivered ? (
                <CheckCheck className="delivered-tick" size={15} />
              ) : (
                <Check size={14} className="delivered-tick" />
              )
            )}
          </div>
        </div>

        {/* Message hover/tap action bar */}
        {!deleted && (
          <div className="message-actions">
            <button onClick={() => onReply(message)} title="Reply"><ArrowLeft size={13} /></button>
            <button onClick={() => onForward(message)} title="Forward"><ChevronDown size={13} /></button>
            <button onClick={() => onPin(message)} title="Pin message"><Pin size={13} /></button>
            {mine && <button onClick={() => onEdit(message)} title="Edit message"><MoreHorizontal size={13} /></button>}
            <button onClick={() => onDelete(message)} title="Delete message"><Trash2 size={13} /></button>
          </div>
        )}
      </div>

      {mine && <span className="message-spacer" />}
    </motion.article>
  );
}

export default function ChatWindow({
  chat, onBack, onSend, onTyping, onReply, onEdit, onDelete, onForward, onPin,
  onDetails, replyTo, onCancelReply, typing, editText, onCancelEdit,
  onOpenWallpaper, wallpaperConfig
}) {
  const scrollRef = useRef(null);
  const [inChatSearch, setInChatSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMedia, setActiveMedia] = useState(null);

  useEffect(() => {
    if (scrollRef.current && !inChatSearch) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.id, chat?.messages?.length, typing, inChatSearch]);

  if (!chat) {
    return (
      <section className="conversation empty-conversation">
        <div className="empty-welcome">
          <span className="welcome-mark">b.</span>
          <h1>Welcome to Blinker-a</h1>
          <p>Private real-time messaging with Telegram and WhatsApp features.</p>
        </div>
      </section>
    );
  }

  const last = chat.messages.at(-1);

  // Filter messages if search is active
  const filteredMessages = chat.messages;
  const matchCount = searchQuery.trim()
    ? chat.messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase())).length
    : 0;

  return (
    <section className="conversation">
      {/* Dynamic WhatsApp-style Wallpaper Layer */}
      <div
        className="conversation-wallpaper-layer"
        style={{
          background: wallpaperConfig?.bg || "#0d1118",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: `blur(${wallpaperConfig?.blur || 0}px)`
        }}
      >
        {wallpaperConfig?.pattern === "doodle" && <div className="doodle-pattern-overlay" />}
        {wallpaperConfig?.pattern === "dots" && <div className="dots-pattern-overlay" />}
        <div
          className="wallpaper-dim-layer"
          style={{ backgroundColor: `rgba(0, 0, 0, ${(wallpaperConfig?.dim ?? 20) / 100})` }}
        />
      </div>

      {/* Header */}
      <header className="conversation-header">
        <button className="icon-button mobile-back" onClick={onBack} aria-label="Back to chats">
          <ArrowLeft size={19} />
        </button>

        <button className="header-person" onClick={onDetails}>
          <Avatar name={chat.name} color={chat.color} online={chat.online} photo={chat.avatarUrl} />
          <span className="header-copy">
            <strong>{chat.name}</strong>
            <small className={typing ? "typing" : chat.online ? "is-online" : ""}>
              {typing ? "typing…" : chat.online ? "online now" : chat.statusText || chat.username || "last seen recently"}
            </small>
          </span>
        </button>

        <div className="header-actions">
          {/* In-chat search toggle */}
          <button
            className={`icon-button ${inChatSearch ? "active" : ""}`}
            title="Search in conversation"
            aria-label="Search"
            onClick={() => setInChatSearch(!inChatSearch)}
          >
            <Search size={18} />
          </button>

          {/* WhatsApp Wallpaper button */}
          <button
            className="icon-button"
            title="Chat Wallpaper (WhatsApp style)"
            aria-label="Wallpaper"
            onClick={onOpenWallpaper}
          >
            <ImageIcon size={18} />
          </button>

          <button
            className="icon-button details-toggle"
            title="Chat Info"
            aria-label="Chat Info"
            onClick={onDetails}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      {/* In-Chat Search Bar */}
      {inChatSearch && (
        <div className="inchat-search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search in this chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && <span className="search-match-count">{matchCount} found</span>}
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              setInChatSearch(false);
              setSearchQuery("");
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Pinned message banner */}
      {chat.pinned && (
        <div className="pinned-bar" role="button" tabIndex="0" onClick={() => onPin(last)}>
          <span className="pin-mark"><Pin size={14} /></span>
          <span className="pinned-copy">
            <strong>Pinned message</strong>
            <small>{chat.pinned}</small>
          </span>
          <ChevronDown size={15} />
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="message-scroll" ref={scrollRef}>
        <div className="date-divider">
          <span>Today</span>
        </div>

        <div className="message-list" aria-live="polite">
          <AnimatePresence initial={false}>
            {filteredMessages.map((message) => {
              const isMatch = searchQuery.trim() && message.text?.toLowerCase().includes(searchQuery.toLowerCase());
              return (
                <MessageRow
                  key={message.id}
                  message={message}
                  chat={chat}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onForward={onForward}
                  onPin={onPin}
                  onImageClick={(url, name) => setActiveMedia({ url, name })}
                  isHighlighted={Boolean(isMatch)}
                />
              );
            })}
          </AnimatePresence>

          {typing && (
            <div className="typing-indicator">
              <span /><span /><span />
              <small>{chat.name.split(" ")[0]} is typing...</small>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <MessageInput
        onSend={onSend}
        onTyping={onTyping}
        replyTo={replyTo}
        onCancelReply={onCancelReply}
        editText={editText}
        onCancelEdit={onCancelEdit}
      />

      <div className="security-note">
        <ShieldCheck size={12} /> Secure connection · Messages are stored on the chat server
      </div>

      {/* Image Lightbox modal */}
      {activeMedia && (
        <div className="image-viewer-overlay" onClick={() => setActiveMedia(null)}>
          <div className="image-viewer-bar" onClick={(e) => e.stopPropagation()}>
            <span className="image-viewer-title">{activeMedia.name || "Photo preview"}</span>
            <div className="image-viewer-tools">
              <a href={activeMedia.url} download="blinker-image.jpg" className="icon-button" title="Download">
                <Download size={18} />
              </a>
              <button className="icon-button" onClick={() => setActiveMedia(null)} title="Close">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="image-viewer-container" onClick={(e) => e.stopPropagation()}>
            <img src={activeMedia.url} alt="Expanded view" className="image-viewer-img" />
          </div>
        </div>
      )}
    </section>
  );
}
