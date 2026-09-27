"use client";

import { useState } from "react";

import { IoSendOutline } from "react-icons/io5";

export default function MessageComposer({
  onSend,
}: {
  onSend: (content: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const content = value.trim();
    if (!content) return;
    const succeeded = await onSend(content);
    if (succeeded) {
      setSent(true);
      setValue("");
      setTimeout(() => setSent(false), 2500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        padding: "1.25rem 1.5rem",
        background: "var(--surface)",
      }}
    >
      {sent && (
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--accent-strong)",
            marginBottom: "0.75rem",
            fontWeight: 500,
          }}
        >
          Message sent ✓
        </p>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "0.75rem",
          background: "var(--surface-2)",
          border: "1px solid var(--border-mid)",
          borderRadius: "12px",
          padding: "0.75rem 1rem",
        }}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message…"
          aria-label="Message input"
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            fontSize: "0.9375rem",
            fontFamily: "inherit",
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={handleSend}
          aria-label="Send message"
          disabled={!value.trim()}
          style={{
            background: value.trim()
              ? "var(--accent-strong)"
              : "var(--surface)",
            border: "1px solid var(--border-mid)",
            borderRadius: "8px",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: value.trim() ? "pointer" : "default",
            color: value.trim() ? "var(--on-accent)" : "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          <IoSendOutline size={16} style={{ strokeWidth: "2.5px" }} />
        </button>
      </div>
      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          marginTop: "0.625rem",
          textAlign: "center",
        }}
      >
        Messages are private and only visible to you and Midigo.
      </p>
    </div>
  );
}
