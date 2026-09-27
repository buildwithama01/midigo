import type { Conversation } from "./chatterTypes";

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="chatter-conversation-list">
      {conversations.map((conversation) => (
        <button
          className={`chatter-conversation-list-item ${activeId === conversation.id ? "is-active" : ""}`}
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          type="button"
        >
          <span className="chatter-avatar chatter-avatar-purple">{conversation.avatar}</span>
          <span className="chatter-conversation-list-copy">
            <span className="chatter-conversation-list-title">
              <strong>{conversation.fanName}</strong>
              {conversation.unread > 0 && <b>{conversation.unread}</b>}
            </span>
            <span className="chatter-conversation-preview">{conversation.preview}</span>
            <span className="chatter-conversation-list-meta">
              <span className={conversation.online ? "chatter-online-text" : "chatter-muted-small"}>
                {conversation.online ? "Online" : "Offline"}
              </span>
              <span>{conversation.timestamp}</span>
            </span>
          </span>
        </button>
      ))}
      {conversations.length === 0 && (
        <div className="chatter-empty-state">
          <strong>No conversations found</strong>
          <p>Try a different name or phrase.</p>
        </div>
      )}
    </div>
  );
}
