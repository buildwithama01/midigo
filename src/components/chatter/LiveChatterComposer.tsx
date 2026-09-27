"use client";

import { useState, type FormEvent } from "react";
import { useChatterWorkspace } from "./ChatterWorkspaceContext";

export default function LiveChatterComposer({
  roomLocked,
  onSend,
}: {
  roomLocked: boolean;
  onSend: (content: string) => void;
}) {
  const [value, setValue] = useState("");
  const { notify } = useChatterWorkspace();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = value.trim();
    if (!message) return;
    if (roomLocked) {
      notify("This room is locked. Unlock it before sending.");
      return;
    }
    onSend(message);
    setValue("");
  };

  return (
    <form className="chatter-composer chatter-live-composer" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="live-room-message">Reply in live room</label>
      <textarea
        aria-label="Reply in live room"
        className="form-input chatter-composer-input"
        disabled={roomLocked}
        id="live-room-message"
        maxLength={500}
        onChange={(event) => setValue(event.target.value)}
        placeholder={roomLocked ? "Unlock the room to reply..." : "Reply as Chatter..."}
        rows={2}
        value={value}
      />
      <div className="chatter-composer-footer">
        <span>Chatter · {value.length}/500</span>
        <button className="btn btn-lime" disabled={!value.trim() || roomLocked} type="submit">
          Send to room
        </button>
      </div>
    </form>
  );
}
