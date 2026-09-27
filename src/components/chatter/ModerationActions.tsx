"use client";

import { useState } from "react";
import type { ModerationAction, ModerationCase } from "./chatterTypes";

const actions: Array<{
  value: ModerationAction;
  label: string;
  description: string;
  destructive: boolean;
}> = [
  {
    value: "warned",
    label: "Warn",
    description: "Send a private reminder about the room rules.",
    destructive: false,
  },
  {
    value: "message-deleted",
    label: "Delete message",
    description: "Remove the flagged message from the room.",
    destructive: true,
  },
  {
    value: "timed-out",
    label: "Timeout",
    description: "Temporarily pause this member's ability to post.",
    destructive: true,
  },
  {
    value: "banned",
    label: "Ban member",
    description: "Remove this member from all Midigo rooms.",
    destructive: true,
  },
  {
    value: "resolved",
    label: "Resolve case",
    description: "Mark the review as complete.",
    destructive: false,
  },
];

export default function ModerationActions({
  item,
  onAction,
}: {
  item: ModerationCase;
  onAction: (action: ModerationAction) => void;
}) {
  const [selectedAction, setSelectedAction] = useState<ModerationAction | null>(null);
  const selected = actions.find((action) => action.value === selectedAction);

  const chooseAction = (action: ModerationAction) => {
    setSelectedAction(action);
  };

  const confirmAction = () => {
    if (!selectedAction) return;
    onAction(selectedAction);
    setSelectedAction(null);
  };

  return (
    <section className="chatter-moderation-actions" aria-label="Moderation actions">
      <div className="chatter-panel-heading chatter-panel-heading-compact">
        <div>
          <p className="label label-purple">Take action</p>
          <h2>Review response</h2>
        </div>
        <span className={`chatter-severity-badge severity-${item.severity}`}>{item.severity}</span>
      </div>

      <div className="chatter-action-case-summary">
        <span className="chatter-avatar chatter-avatar-muted">{item.participantName.slice(0, 2)}</span>
        <div>
          <strong>{item.participantName}</strong>
          <p>{item.reason}</p>
        </div>
      </div>

      <div className="chatter-action-options">
        {actions.map((action) => (
          <button
            className={`chatter-action-option ${selectedAction === action.value ? "is-selected" : ""} ${action.destructive ? "is-destructive" : ""}`}
            key={action.value}
            onClick={() => chooseAction(action.value)}
            type="button"
          >
            <span>
              <strong>{action.label}</strong>
              <small>{action.description}</small>
            </span>
            <span aria-hidden="true">{selectedAction === action.value ? "○" : "○"}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="chatter-action-confirmation">
          <p>
            {selected.value === "resolved"
              ? `Close the case for ${item.participantName}?`
              : `${selected.label.toLowerCase()} ${item.participantName}?`}
          </p>
          <div>
            <button className="chatter-secondary-button" onClick={() => setSelectedAction(null)} type="button">
              Cancel
            </button>
            <button className={`btn ${selected.destructive ? "chatter-danger-button" : "btn-lime"}`} onClick={confirmAction} type="button">
              Confirm {selected.label.toLowerCase()}
            </button>
          </div>
        </div>
      )}

      {item.status === "resolved" && (
        <p className="chatter-resolved-note">This case has been resolved. You can still review the activity trail below.</p>
      )}
    </section>
  );
}
