import type { LiveRoom } from "./chatterTypes";

export default function RoomSelector({
  rooms,
  activeRoomId,
  onSelect,
}: {
  rooms: LiveRoom[];
  activeRoomId: string;
  onSelect: (roomId: string) => void;
}) {
  return (
    <div className="chatter-room-selector" aria-label="Live rooms">
      {rooms.map((room) => {
        const onlineCount = room.participants.filter((participant) => participant.online).length;
        const active = room.id === activeRoomId;
        return (
          <button
            className={`chatter-room-selector-item ${active ? "is-active" : ""}`}
            key={room.id}
            onClick={() => onSelect(room.id)}
            type="button"
          >
            <span className={`chatter-room-status ${room.live ? "is-live" : ""}`}>
              <i />
            </span>
            <span className="chatter-room-selector-copy">
              <strong>{room.title}</strong>
              <small>
                {room.live ? `${onlineCount} online` : room.locked ? "Locked" : "Upcoming"} · {room.messages.length} messages
              </small>
            </span>
            <span aria-hidden="true">{active ? "→" : "↗"}</span>
          </button>
        );
      })}
    </div>
  );
}
