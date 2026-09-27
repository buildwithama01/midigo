import Link from "next/link";

export default function FeaturedChat() {
  return (
    <div
      style={{
        background: "var(--purple-bg)",
        border: "1px solid var(--border-mid)",
        borderRadius: "12px",
        padding: "3rem",
        marginBottom: "4rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "1.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent-strong)",
            boxShadow: "0 0 0 2px var(--accent-glow)",
          }}
        />
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-strong)" }}>
          Midigo is Live
        </span>
      </div>
      
      <div>
        <h2
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
            lineHeight: 1.1,
          }}
        >
          Midnight Q&A: The Genesis Prompt
        </h2>
        <p
          style={{
            fontSize: "1.0625rem",
            color: "var(--text-purple)",
            lineHeight: 1.6,
            maxWidth: "600px",
            fontWeight: 300,
          }}
        >
          An exclusive dive into the initial prompts and rendering setups that brought Midigo to life. 
          Join the conversation and ask your burning questions directly.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
        <Link href="/dashboard/live-chats" className="btn btn-lime">
          Join the Conversation
        </Link>
      </div>
    </div>
  );
}
