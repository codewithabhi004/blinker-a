import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export default function VoiceNotePlayer({ waveform, duration = "0:18", mine }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const bars = waveform && waveform.length > 0 
    ? waveform 
    : [25, 50, 75, 90, 60, 45, 80, 100, 65, 40, 70, 85, 55, 30, 65, 90, 75, 45, 25];

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            setPlaying(false);
            return 0;
          }
          return prev + 0.05;
        });
      }, 200);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing]);

  const togglePlay = () => {
    setPlaying(!playing);
  };

  return (
    <div className={`voice-player ${mine ? "mine" : ""}`}>
      <button 
        type="button" 
        className="voice-play-btn" 
        onClick={togglePlay}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
      >
        {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
      </button>
      <div className="voice-waveform">
        <div className="waveform-bars">
          {bars.map((height, i) => {
            const barProgress = i / bars.length;
            const isPlayed = barProgress <= progress;
            return (
              <span
                key={i}
                className={`wave-bar ${isPlayed ? "played" : ""}`}
                style={{ height: `${Math.max( height * 0.28, 5)}px` }}
              />
            );
          })}
        </div>
        <div className="voice-timer">
          <span>{playing ? `0:0${Math.floor(progress * 18)}` : duration}</span>
          <span className="voice-tag">Voice message</span>
        </div>
      </div>
    </div>
  );
}
