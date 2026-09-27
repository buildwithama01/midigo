"use client";

import { useChatterWorkspace } from "./ChatterWorkspaceContext";
import type { LiveRoom } from "./chatterTypes";

export default function RoomControls({
  room,
  onSlowModeChange,
  onLockChange,
}: {
  room: LiveRoom;
  onSlowModeChange: (enabled: boolean) => void;
  onLockChange: (locked: boolean) => void;
}) {
  const { notify } = useChatterWorkspace();

  const toggleSlowMode = () => {
    onSlowModeChange(!room.slowMode);
    notify(room.slowMode ? "Slow mode turned off." : "Slow mode turned on.");
  };

  const toggleLock = () => {
    onLockChange(!room.locked);
    notify(room.locked ? "Room unlocked for members." : "Room locked for members.");
  };

  return (
    <section className="chatter-room-controls" aria-label="Room controls">
      <div className="chatter-panel-heading chatter-panel-heading-compact">
        <div>
          <p className="label label-purple">Console</p>
          <h2>Room controls</h2>
        </div>
      </div>
      <div className="chatter-control-row">
        <span>
          <strong>Slow mode</strong>
          <small>Limit how often members can post</small>
        </span>
        <button aria-pressed={room.slowMode} className={`chatter-toggle ${room.slowMode ? "is-on" : ""}`} onClick={toggleSlowMode} type="button">
          <span />
          <b>{room.slowMode ? "On" : "Off"}</b>
        </button>
      </div>
      <div className="chatter-control-row">
        <span>
          <strong>Room lock</strong>
          <small>{room.locked ? "Members cannot enter" : "Members can enter"}</small>
        </span>
        <button aria-pressed={room.locked} className={`chatter-toggle ${room.locked ? "is-on" : ""}`} onClick={toggleLock} type="button">
          <span />
          <b>{room.locked ? "Locked" : "Open"}</b>
        </button>
      </div>
      <button className="chatter-secondary-button" onClick={() => notify("Room settings are saved for this session.")} type="button">
        Save room settings
      </button>
    </section>
  );
}
