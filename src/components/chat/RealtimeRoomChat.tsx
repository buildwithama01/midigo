"use client";

import { useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type Room = Database["public"]["Tables"]["live_rooms"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];
type Profile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "name" | "handle" | "role"
>;
type Supabase = ReturnType<typeof createClient>;

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RealtimeRoomChat() {
  const [supabase, setSupabase] = useState<Supabase | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let client: Supabase | null = null;

    void Promise.resolve()
      .then(() => createClient())
      .then(async (createdClient) => {
        client = createdClient;
        if (cancelled) return;
        setSupabase(createdClient);

        const [{ data: authData }, { data: roomData, error: roomError }] =
          await Promise.all([
            createdClient.auth.getUser(),
            createdClient
              .from("live_rooms")
              .select("*")
              .in("status", ["live", "upcoming"])
              .order("created_at"),
          ]);

        if (cancelled) return;
        if (roomError) {
          setError(roomError.message);
          return;
        }

        if (authData.user) {
          const { data: currentProfile } = await createdClient
            .from("profiles")
            .select("id, name, handle, role")
            .eq("id", authData.user.id)
            .maybeSingle();
          if (cancelled) return;
          setProfile(currentProfile);
        }

        setRooms(roomData ?? []);
        setActiveRoomId((current) => current ?? roomData?.[0]?.id ?? null);
      })
      .catch((cause: unknown) => {
        if (!cancelled)
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load live rooms.",
          );
      });

    return () => {
      cancelled = true;
      if (client) void client.removeAllChannels();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("live-room-counts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_rooms" },
        (payload) => {
          const changedRoom = (payload.new ?? payload.old) as Room;
          if (!changedRoom?.id) return;
          setRooms((current) => {
            if (changedRoom.status === "ended")
              return current.filter((room) => room.id !== changedRoom.id);
            const exists = current.some((room) => room.id === changedRoom.id);
            return exists
              ? current.map((room) =>
                  room.id === changedRoom.id
                    ? { ...room, ...changedRoom }
                    : room,
                )
              : [...current, changedRoom];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? null;

  useEffect(() => {
    if (!supabase || !activeRoomId) return;
    let cancelled = false;

    void supabase
      .from("messages")
      .select("*")
      .eq("live_room_id", activeRoomId)
      .order("created_at", { ascending: true })
      .then(({ data, error: queryError }) => {
        if (cancelled) return;
        if (queryError) setError(queryError.message);
        else setMessages(data ?? []);
      });

    const channel = supabase
      .channel(`live-room-messages-${activeRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `live_room_id=eq.${activeRoomId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          const message = payload.new as Message;
          setMessages((current) =>
            current.some((item) => item.id === message.id)
              ? current
              : [...current, message],
          );
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [supabase, activeRoomId]);

  const joinRoom = async (room: Room) => {
    if (!supabase || !profile) {
      setError("Sign in to join a live room.");
      return;
    }
    setBusy(true);
    setError("");
    if (joinedRoomId && joinedRoomId !== room.id) {
      const { error: leaveError } = await supabase.rpc("leave_live_room", {
        target_room_id: joinedRoomId,
      });
      if (leaveError) {
        setBusy(false);
        setError(leaveError.message);
        return;
      }
    }
    const { data, error: joinError } = await supabase.rpc("join_live_room", {
      target_room_id: room.id,
    });
    setBusy(false);
    if (joinError) {
      setError(joinError.message);
      return;
    }
    setJoinedRoomId(room.id);
    setRooms((current) =>
      current.map((item) =>
        item.id === room.id ? { ...item, current_participants: data } : item,
      ),
    );
  };

  const leaveRoom = async () => {
    if (!supabase || !joinedRoomId) return;
    const roomId = joinedRoomId;
    setBusy(true);
    const { data, error: leaveError } = await supabase.rpc("leave_live_room", {
      target_room_id: roomId,
    });
    setBusy(false);
    if (leaveError) {
      setError(leaveError.message);
      return;
    }
    setJoinedRoomId(null);
    setRooms((current) =>
      current.map((room) =>
        room.id === roomId ? { ...room, current_participants: data } : room,
      ),
    );
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !profile || !activeRoom || !draft.trim()) return;
    if (joinedRoomId !== activeRoom.id) {
      setError("Join this room before sending a message.");
      return;
    }

    setBusy(true);
    setError("");
    const { error: sendError } = await supabase.from("messages").insert({
      conversation_id: null,
      live_room_id: activeRoom.id,
      sender_id: profile.id,
      sender_name: profile.name || profile.handle || "Member",
      sender:
        profile.role === "chatter"
          ? "chatter"
          : profile.role === "fan"
            ? "fan"
            : "midigo",
      content: draft.trim(),
      type: "text",
    });
    setBusy(false);
    if (sendError) {
      setError(sendError.message);
      return;
    }
    setDraft("");
  };

  return (
    <div className="realtime-room-chat">
      <div className="realtime-room-list" aria-label="Live rooms">
        <h2>Rooms</h2>
        {rooms.map((room) => (
          <button
            aria-pressed={activeRoom?.id === room.id}
            className={activeRoom?.id === room.id ? "is-active" : ""}
            key={room.id}
            onClick={() => setActiveRoomId(room.id)}
            type="button"
          >
            <strong>{room.title}</strong>
            <span>
              {room.status === "live" ? "Live" : "Upcoming"} ·{" "}
              {room.current_participants} joined
            </span>
          </button>
        ))}
        {rooms.length === 0 && <p>No live or upcoming rooms are available.</p>}
      </div>

      <section className="realtime-room-panel" aria-label="Room chat">
        {activeRoom ? (
          <>
            <header>
              <div>
                <p>
                  {activeRoom.status === "live" ? "LIVE ROOM" : "UPCOMING ROOM"}
                </p>
                <h2>{activeRoom.title}</h2>
                <span>{activeRoom.current_participants} participants</span>
              </div>
              {activeRoom.status === "live" &&
                (joinedRoomId === activeRoom.id ? (
                  <button
                    disabled={busy}
                    onClick={() => void leaveRoom()}
                    type="button"
                  >
                    Leave room
                  </button>
                ) : (
                  <button
                    disabled={busy || !profile}
                    onClick={() => void joinRoom(activeRoom)}
                    type="button"
                  >
                    {busy ? "Joining…" : "Join Room"}
                  </button>
                ))}
            </header>

            <div className="realtime-room-messages" aria-live="polite">
              {messages
                .filter((message) => message.live_room_id === activeRoom.id)
                .map((message) => (
                  <article key={message.id}>
                    <strong>{message.sender_name}</strong>
                    <time>{formatTime(message.created_at)}</time>
                    <p>{message.content}</p>
                  </article>
                ))}
              {messages.filter(
                (message) => message.live_room_id === activeRoom.id,
              ).length === 0 && <p>No messages in this room yet.</p>}
            </div>

            {activeRoom.status === "live" && joinedRoomId === activeRoom.id && (
              <form onSubmit={(event) => void sendMessage(event)}>
                <textarea
                  aria-label="Message in live room"
                  maxLength={1000}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message..."
                  rows={2}
                  value={draft}
                />
                <button disabled={busy || !draft.trim()} type="submit">
                  Send
                </button>
              </form>
            )}
          </>
        ) : (
          <p>Select a room to see its messages.</p>
        )}
        {error && (
          <p className="realtime-room-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <style jsx>{`
        .realtime-room-chat {
          display: grid;
          grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
          gap: 1.25rem;
          color: var(--text-primary);
        }
        .realtime-room-list,
        .realtime-room-panel {
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: 8px;
          min-width: 0;
        }
        .realtime-room-list {
          padding: 1rem;
        }
        .realtime-room-list h2 {
          font-size: 1rem;
          margin: 0 0 0.75rem;
        }
        .realtime-room-list button {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
          width: 100%;
          padding: 0.85rem;
          margin-top: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: inherit;
          text-align: left;
          cursor: pointer;
        }
        .realtime-room-list button.is-active {
          border-color: var(--accent-strong);
          background: var(--surface-2);
        }
        .realtime-room-list button span,
        .realtime-room-panel header span {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .realtime-room-panel {
          display: flex;
          min-height: 480px;
          flex-direction: column;
        }
        .realtime-room-panel header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          border-bottom: 1px solid var(--border);
        }
        .realtime-room-panel header p {
          margin: 0 0 0.4rem;
          color: var(--accent-strong);
          font-size: 0.7rem;
          font-weight: 700;
        }
        .realtime-room-panel header h2 {
          margin: 0 0 0.4rem;
          font-size: 1.25rem;
        }
        .realtime-room-panel button {
          padding: 0.65rem 0.9rem;
          border: 1px solid var(--border-mid);
          border-radius: 6px;
          background: var(--accent-strong);
          color: var(--on-accent);
          font: inherit;
          font-weight: 600;
          cursor: pointer;
        }
        .realtime-room-panel button:disabled {
          opacity: 0.55;
          cursor: wait;
        }
        .realtime-room-messages {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 0.75rem;
          overflow: auto;
          padding: 1rem 1.25rem;
        }
        .realtime-room-messages article {
          max-width: 90%;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--surface-2);
        }
        .realtime-room-messages article time {
          margin-left: 0.6rem;
          color: var(--text-muted);
          font-size: 0.72rem;
        }
        .realtime-room-messages article p {
          margin: 0.35rem 0 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        .realtime-room-panel form {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border);
        }
        .realtime-room-panel textarea {
          flex: 1;
          min-width: 0;
          resize: vertical;
          padding: 0.65rem;
          border: 1px solid var(--border-mid);
          border-radius: 6px;
          background: var(--surface-2);
          color: inherit;
          font: inherit;
        }
        .realtime-room-error {
          padding: 0 1.25rem 1rem;
          margin: 0;
          color: #b42318;
        }
        @media (max-width: 700px) {
          .realtime-room-chat {
            grid-template-columns: 1fr;
          }
          .realtime-room-panel {
            min-height: 420px;
          }
        }
      `}</style>
    </div>
  );
}
