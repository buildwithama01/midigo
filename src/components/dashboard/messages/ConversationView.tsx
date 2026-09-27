"use client";

import { useState } from "react";
import { IoPlay, IoPause, IoCheckmarkDoneOutline } from "react-icons/io5";
import { Message } from "./messageData";

function VoiceNote({ msg }: { msg: Message }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    // Simulate playback progress
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setPlaying(false);
        setProgress(0);
      }
    }, 200);
  };

  return (
    <div
      style={{
        background: "var(--purple-bg)",
        border: "1px solid var(--border-mid)",
        borderRadius: "12px",
        padding: "1rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        maxWidth: "320px",
      }}
    >
      <button
        onClick={handlePlay}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: playing ? "var(--accent-strong)" : "var(--purple)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: playing ? "var(--on-accent)" : "var(--text-primary)",
        }}
      >
        {playing ? <IoPause size={14} /> : <IoPlay size={14} />}
      </button>

      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "0.375rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-purple)" }}>
            Voice Note
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{msg.duration}</span>
        </div>
        <div
          style={{
            height: "3px",
            background: "var(--border-mid)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "var(--purple)",
              borderRadius: "2px",
              transition: "width 0.2s linear",
            }}
          />
        </div>
        <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.375rem" }}>
          Personalized for you
        </p>
      </div>
    </div>
  );
}

export default function ConversationView({ messages }: { messages: Message[] }) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {messages.map((msg) => {
        const isFromMidigo = msg.from === "midigo";
        return (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isFromMidigo ? "flex-start" : "flex-end",
              gap: "0.375rem",
            }}
          >
            {isFromMidigo && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--purple-bg)",
                    border: "1px solid var(--purple)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    color: "var(--text-purple)",
                  }}
                >
                  M
                </div>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>Midigo</span>
              </div>
            )}

            {msg.type === "voice" ? (
              <VoiceNote msg={msg} />
            ) : (
              <div
                style={{
                  background: isFromMidigo ? "var(--surface-2)" : "var(--purple-bg)",
                  border: `1px solid ${isFromMidigo ? "var(--border)" : "var(--border-mid)"}`,
                  borderRadius: isFromMidigo ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                  padding: "0.875rem 1.125rem",
                  maxWidth: "480px",
                }}
              >
                <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: 1.65, fontWeight: 300 }}>
                  {msg.content}
                </p>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{msg.timestamp}</span>
              {!isFromMidigo && (
                <IoCheckmarkDoneOutline size={14} style={{ color: "var(--text-muted)" }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
