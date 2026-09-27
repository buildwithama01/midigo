import type { ModerationCase } from "./chatterTypes";

export default function FlaggedItems({
  cases,
  selectedId,
  onSelect,
}: {
  cases: ModerationCase[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="chatter-flagged-list" aria-label="Flagged moderation items">
      {cases.map((item) => (
        <button
          className={`chatter-flagged-item ${selectedId === item.id ? "is-active" : ""}`}
          key={item.id}
          onClick={() => onSelect(item.id)}
          type="button"
        >
          <span className={`chatter-severity-dot severity-${item.severity}`} />
          <span className="chatter-flagged-item-copy">
            <span className="chatter-flagged-item-title">
              <strong>{item.participantName}</strong>
              <time>{item.createdAt}</time>
            </span>
            <span className="chatter-flagged-item-message">“{item.message}”</span>
            <span className="chatter-flagged-item-meta">
              <span>{item.reason}</span>
              <span className={`chatter-case-status status-${item.status}`}>{item.status}</span>
            </span>
          </span>
          <span aria-hidden="true">{selectedId === item.id ? "→" : "↗"}</span>
        </button>
      ))}
      {cases.length === 0 && (
        <div className="chatter-empty-state">
          <strong>No cases in this view</strong>
          <p>Change the filter to see other moderation activity.</p>
        </div>
      )}
    </div>
  );
}
