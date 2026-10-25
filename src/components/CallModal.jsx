import { useEffect, useState } from "react";
import { Camera, Mic, MicOff, PhoneOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import Avatar from "./Avatar.jsx";

export default function CallModal({ contact, isVideo = false, onClose }) {
  const [callState, setCallState] = useState("ringing"); // "calling" | "ringing" | "connected"
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(isVideo);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    const ringTimer = setTimeout(() => {
      setCallState("connected");
    }, 2800);

    return () => clearTimeout(ringTimer);
  }, []);

  useEffect(() => {
    let interval = null;
    if (callState === "connected") {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="call-overlay">
      <div className={`call-container ${isVideoOn ? "video-mode" : ""}`}>
        {/* If video mode, background can be a simulated camera feed */}
        {isVideoOn && (
          <div className="call-video-bg">
            <img 
              src={contact.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80"} 
              alt={contact.name} 
              className="call-remote-video"
            />
            <div className="call-self-preview">
              <span className="self-label">You</span>
              <div className="self-feed">
                <Avatar name="Alex Morgan" color="#9088e8" small />
              </div>
            </div>
          </div>
        )}

        <div className="call-header">
          <span className="call-badge">{isVideoOn ? "Encrypted Video Call" : "Encrypted Voice Call"}</span>
          <h2 className="call-name">{contact.name}</h2>
          <p className="call-status">
            {callState === "calling" && "Calling..."}
            {callState === "ringing" && "Ringing..."}
            {callState === "connected" && formatTimer(seconds)}
          </p>
        </div>

        {!isVideoOn && (
          <div className="call-avatar-wrap">
            <div className={`call-pulse ${callState === "ringing" ? "pulsing" : ""}`} />
            <Avatar name={contact.name} color={contact.color} photo={contact.avatarUrl} />
          </div>
        )}

        <div className="call-controls">
          <button 
            type="button" 
            className={`call-btn ${isMuted ? "active" : ""}`}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </button>

          <button 
            type="button" 
            className={`call-btn ${isVideoOn ? "active" : ""}`}
            onClick={() => setIsVideoOn(!isVideoOn)}
            title={isVideoOn ? "Stop Video" : "Start Video"}
          >
            {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
            <span>{isVideoOn ? "Camera on" : "Camera off"}</span>
          </button>

          <button 
            type="button" 
            className={`call-btn ${isSpeaker ? "active" : ""}`}
            onClick={() => setIsSpeaker(!isSpeaker)}
            title="Speaker"
          >
            {isSpeaker ? <Volume2 size={22} /> : <VolumeX size={22} />}
            <span>Speaker</span>
          </button>

          <button 
            type="button" 
            className="call-btn end-call"
            onClick={onClose}
            title="End Call"
          >
            <PhoneOff size={26} />
            <span>End</span>
          </button>
        </div>
      </div>
    </div>
  );
}
