import type { Conversation } from "./chatterTypes";

export default function ConversationThread({
  conversation,
  onSendMessage,
}: {
  conversation: Conversation;
  onSendMessage: (content: string) => void;
}) {
  return (
    <section className="chatter-thread" aria-label={`Conversation with ${conversation.fanName}`}>
      <div className="chatter-thread-header">
        <span className="chatter-avatar chatter-avatar-purple">{conversation.avatar}</span>
        <div>
          <h2>{conversation.fanName}</h2>
          <p className={conversation.online ? "chatter-online-text" : "chatter-muted-small"}>
            {conversation.online ? "Online now" : "Offline"} · {conversation.messages.length} messages
          </p>
        </div>
        <span className={`chatter-priority chatter-priority-${conversation.priority}`}>
          {conversation.priority}
        </span>
      </div>

      <div className="chatter-thread-messages">
        {conversation.messages.map((message) => {
          const isChatter = message.from === "chatter";
          return (
            <div className={`chatter-message-row ${isChatter ? "is-mine" : ""}`} key={message.id}>
              {!isChatter && <span className="chatter-message-avatar">{conversation.avatar}</span>}
              <div className="chatter-message-bubble-wrap">
                <div className="chatter-message-bubble">
                  <p>{message.content}</p>
                  {message.reported && <span className="chatter-reported-label">Reported</span>}
                </div>
                <time>{message.timestamp}</time>
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="chatter-composer"
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get("message");
          if (typeof value === "string" && value.trim()) {
            onSendMessage(value.trim());
            event.currentTarget.reset();
          }
        }}
      >
        <label className="sr-only" htmlFor="conversation-message">Message {conversation.fanName}</label>
        <textarea
          aria-label="Message"
          className="form-input chatter-composer-input"
          id="conversation-message"
          name="message"
          placeholder="Write a reply..."
          rows={2}
        />
        <button className="btn btn-lime chatter-composer-send" type="submit">Send</button>
      </form>
    </section>
  );
}
