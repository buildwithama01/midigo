import { CANNED_REPLIES } from "./chatterData";

export default function CannedReplyBar({
  onInsert,
}: {
  onInsert: (message: string) => void;
}) {
  return (
    <div className="chatter-canned-replies">
      <span className="label">Quick replies</span>
      <div>
        {CANNED_REPLIES.map((reply) => (
          <button key={reply.id} onClick={() => onInsert(reply.message)} type="button">
            {reply.label}
          </button>
        ))}
      </div>
    </div>
  );
}
