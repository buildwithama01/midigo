import { Conversation } from "./messageData";

export default function MessageList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>No messages yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          style={{
            background: activeId === conv.id ? "var(--accent-soft)" : "transparent",
            border: "none",
            borderBottom: "1px solid var(--border)",
            padding: "1.25rem 1.5rem",
            textAlign: "left",
            cursor: "pointer",
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            fontFamily: "inherit",
          }}
          className="message-list-item"
        >
          {/* Avatar */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--purple-bg)",
              border: "1px solid var(--purple)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--text-purple)",
              flexShrink: 0,
            }}
          >
            M
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
              <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Midigo
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{conv.timestamp}</span>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: conv.unread ? "var(--text-secondary)" : "var(--text-muted)",
                fontWeight: conv.unread ? 500 : 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {conv.preview}
            </p>
          </div>

          {conv.unread && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--purple)",
                flexShrink: 0,
                marginTop: "6px",
              }}
            />
          )}
        </button>
      ))}
      <style>{`
        .message-list-item:hover { background: var(--hover-subtle); }
      `}</style>
    </div>
  );
}
