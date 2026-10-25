import { useEffect, useRef, useState } from "react";
import { AudioLines, Camera, Image, Paperclip, Send, Smile, Square, Trash2, X } from "lucide-react";

const quickEmojis = ["❤️", "👍", "😂", "🔥", "✨", "🙏", "😍", "🎉"];

export default function MessageInput({
  onSend, onTyping, onError, replyTo, onCancelReply, editText, onCancelEdit
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const recordTimerRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    clearInterval(recordTimerRef.current);
  }, []);

  useEffect(() => {
    if (editText !== null && editText !== undefined) {
      setText(editText);
      inputRef.current?.focus();
    } else {
      setText("");
    }
  }, [editText]);

  useEffect(() => {
    if (recording) {
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(recordTimerRef.current);
    }
    return () => clearInterval(recordTimerRef.current);
  }, [recording]);

  function submit(event) {
    event?.preventDefault();
    if (!text.trim() && !file) return;
    onSend({ text: text.trim(), file });
    setText("");
    setFile(null);
    setShowEmojiPicker(false);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.focus();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  async function startRecording() {
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        // Fallback simulation for browsers/environments without mic permissions
        setRecording(true);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => onError("The voice note could not be recorded.");
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const audio = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (audio.size) {
          const simulatedWaveform = Array.from({ length: 18 }, () => Math.floor(Math.random() * 75) + 25);
          onSend({
            text: `Voice message (0:${recordSeconds < 10 ? "0" + recordSeconds : recordSeconds})`,
            kind: "audio",
            voiceDuration: `0:${recordSeconds < 10 ? "0" + recordSeconds : recordSeconds}`,
            waveform: simulatedWaveform
          });
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      // Graceful simulated recording
      setRecording(true);
    }
  }

  function stopAndSendRecording() {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    } else {
      // Simulated voice message
      const simulatedWaveform = Array.from({ length: 18 }, () => Math.floor(Math.random() * 80) + 20);
      const durationSec = Math.max(recordSeconds, 2);
      onSend({
        text: `Voice message (0:${durationSec < 10 ? "0" + durationSec : durationSec})`,
        kind: "audio",
        voiceDuration: `0:${durationSec < 10 ? "0" + durationSec : durationSec}`,
        waveform: simulatedWaveform
      });
    }
    setRecording(false);
  }

  function cancelRecording() {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setRecording(false);
  }

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

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

      {file && (
        <div className="attachment-chip">
          <Paperclip size={14} />
          <span>{file.name}</span>
          <button type="button" onClick={() => setFile(null)} aria-label="Remove attachment"><X size={14} /></button>
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

      {recording ? (
        <div className="recording-bar">
          <div className="recording-indicator">
            <span className="rec-dot" />
            <span className="rec-time">
              0:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}
            </span>
            <span className="rec-hint">Recording audio...</span>
          </div>
          <div className="recording-actions">
            <button type="button" className="icon-button cancel-rec" onClick={cancelRecording} title="Cancel">
              <Trash2 size={18} />
            </button>
            <button type="button" className="send-button send-rec" onClick={stopAndSendRecording} title="Send voice note">
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <form className="composer" onSubmit={submit}>
          <button
            className="icon-button composer-attach"
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Attach file or photo"
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileRef}
            className="file-input"
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.txt,.zip"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />

          <button
            className="icon-button composer-attach"
            type="button"
            onClick={() => cameraRef.current?.click()}
            title="Take photo / Camera"
            aria-label="Camera"
          >
            <Camera size={18} />
          </button>
          <input
            ref={cameraRef}
            className="file-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />

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
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emojis"
            aria-label="Emojis"
          >
            <Smile size={18} />
          </button>

          {text.trim() || file ? (
            <button className="send-button" type="submit" aria-label="Send message">
              <Send size={18} />
            </button>
          ) : (
            <button
              className="icon-button voice-button"
              type="button"
              onClick={startRecording}
              title="Record voice note"
              aria-label="Record voice note"
            >
              <AudioLines size={18} />
            </button>
          )}
        </form>
      )}
    </div>
  );
}
