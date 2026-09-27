import { getParticipant } from "./chatterData";
import type { LiveRoom } from "./chatterTypes";

export default function LiveMessageFeed({ room }: { room: LiveRoom }) {
  return (
    <section className="chatter-live-feed" aria-label={`Messages in ${room.title}`}>
      <div className="chatter-live-feed-heading">
        <div>
          <p className="label label-purple">Room conversation</p>
          <h2>Live messages</h2>
        </div>
        {room.slowMode && <span className="chatter-slow-mode-badge">Slow mode on</span>}
      </div>

      <div className="chatter-live-messages">
        {room.messages.map((message) => {
          const participant = getParticipant(room.id, message.participantId);
          const isChatter = participant?.role === "chatter";
          const isMidigo = participant?.role === "midigo";
          return (
            <article className={`chatter-live-message ${isChatter ? "is-chatter" : ""} ${isMidigo ? "is-midigo" : ""}`} key={message.id}>
              <span className="chatter-avatar chatter-avatar-muted">
                {participant?.avatar ?? "?"}
              </span>
              <div className="chatter-live-message-copy">
                <div className="chatter-live-message-meta">
                  <strong>{participant?.name ?? "Unknown member"}</strong>
                  <time>{message.timestamp}</time>
                </div>
                <p>{message.content}</p>
                {message.reported && (
                  <span className="chatter-reported-label">
                    Flagged · {message.severity ?? "review"}
                  </span>
                )}
              </div>
            </article>
          );
        })}
        {room.messages.length === 0 && (
          <div className="chatter-empty-state">
            <strong>This room is quiet</strong>
            <p>Messages will appear here when the room opens.</p>
          </div>
        )}
      </div>
    </section>
  );
}
