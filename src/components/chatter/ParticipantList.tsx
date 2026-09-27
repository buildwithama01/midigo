"use client";

import { useMemo, useState } from "react";
import type { Participant } from "./chatterTypes";

export default function ParticipantList({
  participants,
}: {
  participants: Participant[];
}) {
  const [query, setQuery] = useState("");
  const visibleParticipants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...participants]
      .sort((a, b) => Number(b.online) - Number(a.online) || a.name.localeCompare(b.name))
      .filter((participant) =>
        !normalizedQuery || participant.name.toLowerCase().includes(normalizedQuery),
      );
  }, [participants, query]);

  return (
    <section className="chatter-participant-panel" aria-label="Room participants">
      <div className="chatter-panel-heading chatter-panel-heading-compact">
        <div>
          <p className="label label-purple">People</p>
          <h2>Participants</h2>
        </div>
        <span className="chatter-count-badge">{visibleParticipants.length}</span>
      </div>
      <label className="chatter-search-field chatter-participant-search">
        <span aria-hidden="true">⌕</span>
        <span className="sr-only">Search participants</span>
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a member..."
          type="search"
          value={query}
        />
      </label>
      <div className="chatter-participant-list">
        {visibleParticipants.map((participant) => (
          <div className="chatter-participant-row" key={participant.id}>
            <span className="chatter-avatar chatter-avatar-muted">{participant.avatar}</span>
            <span className="chatter-participant-copy">
              <strong>{participant.name}</strong>
              <small className={participant.online ? "chatter-online-text" : "chatter-muted-small"}>
                {participant.online ? "Online" : "Away"} · {participant.role}
              </small>
            </span>
            <span className={`chatter-participant-presence ${participant.online ? "is-online" : ""}`} aria-label={participant.online ? "Online" : "Offline"} />
          </div>
        ))}
        {visibleParticipants.length === 0 && (
          <div className="chatter-empty-state">
            <strong>No members found</strong>
            <p>Try another name.</p>
          </div>
        )}
      </div>
    </section>
  );
}
