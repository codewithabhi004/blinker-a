import { useEffect, useRef, useState } from "react";
import { Send, Smile, X } from "lucide-react";

const quickEmojis = ["❤️", "👍", "😂", "🔥", "✨", "🙏", "😍", "🎉"];

export default function MessageInput({
  onSend, onTyping, replyTo, onCancelReply, editText, onCancelEdit
}) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setText(editText ?? "");
    if (editText !== null && editText !== undefined) inputRef.current?.focus();
  }, [editText]);

  function submit(event) {
    event?.preventDefault();
    const message = text.trim();
    if (!message) return;
    onSend({ text: message });
    setText("");
    setShowEmojiPicker(false);
    if (inputRef.current) inputRef.current.style.height = "auto";
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  function handleEmojiClick(emoji) {
    setText((previous) => previous + emoji);
  }

  return (
    <div className="composer-wrap">
      {editText !== null && editText !== undefined && (
        <div className="replying-to">
          <span><b>Editing message</b> Update the text and send</span>
          <button type="button" onClick={onCancelEdit} aria-label="Cancel editing"><X size={15} /></button>
        </div>
      )}

      {replyTo && (
        <div className="replying-to">
          <span><b>Replying to</b> {replyTo.text}</span>
          <button type="button" onClick={onCancelReply} aria-label="Cancel reply"><X size={15} /></button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="quick-emoji-row">
          {quickEmojis.map((emoji) => (
            <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} className="emoji-chip">
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form className="composer" onSubmit={submit}>
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            onTyping();
            event.target.style.height = "auto";
            event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          aria-label="Write a message"
          maxLength={4000}
        />
        <button
          className={`icon-button composer-emoji ${showEmojiPicker ? "active" : ""}`}
          type="button"
          onClick={() => setShowEmojiPicker((shown) => !shown)}
          title="Emojis"
          aria-label="Emojis"
        >
          <Smile size={18} />
        </button>
        <button className="send-button" type="submit" aria-label="Send message" disabled={!text.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
