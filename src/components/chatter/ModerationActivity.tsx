import type { ModerationAuditEvent } from "./chatterTypes";

export default function ModerationActivity({ events }: { events: ModerationAuditEvent[] }) {
  return (
    <section className="chatter-moderation-activity" aria-label="Moderation activity">
      <div className="chatter-panel-heading chatter-panel-heading-compact">
        <div>
          <p className="label label-purple">Session trail</p>
          <h2>Recent activity</h2>
        </div>
      </div>
      <div className="chatter-activity-list">
        {events.map((event) => (
          <article className="chatter-activity-row" key={event.id}>
            <span className={`chatter-activity-icon action-${event.action}`} aria-hidden="true">
              {event.action === "resolved" ? "✓" : "!"}
            </span>
            <div>
              <strong>{event.action.replace("-", " ")}</strong>
              <p>{event.details}</p>
              <small>{event.target} · {event.timestamp}</small>
            </div>
          </article>
        ))}
        {events.length === 0 && (
          <div className="chatter-empty-state">
            <strong>No actions yet</strong>
            <p>Actions taken in this session will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
