"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type { Conversation, Message } from "./messageData";
import MessageList from "./MessageList";
import ConversationView from "./ConversationView";
import MessageComposer from "./MessageComposer";
import { IoChevronBackOutline } from "react-icons/io5";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type Supabase = ReturnType<typeof createClient>;

function displayTime(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    from: row.sender === "fan" ? "fan" : "midigo",
    type: row.type,
    content: row.content ?? undefined,
    duration: row.voice_duration ?? undefined,
    timestamp: displayTime(row.created_at),
    read: row.read,
  };
}

function mapConversation(
  row: ConversationRow,
  rows: MessageRow[],
): Conversation {
  const thread = rows.filter((message) => message.conversation_id === row.id);
  const latest = thread[thread.length - 1];
  return {
    id: row.id,
    preview: latest?.content ?? row.subject,
    timestamp: latest
      ? displayTime(latest.created_at)
      : displayTime(row.updated_at),
    unread: thread.some((message) => !message.read && message.sender !== "fan"),
    messages: thread.map(mapMessage),
  };
}

export default function MessagesClient() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "conversation">("list");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [client, setClient] = useState<Supabase | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve()
      .then(() => createClient())
      .then(async (supabase) => {
        if (cancelled) return;
        setClient(supabase);
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.push("/sign-in");
          return;
        }
        setUserId(authData.user.id);
        const { data: conversationRows, error: conversationError } =
          await supabase
            .from("conversations")
            .select("*")
            .order("updated_at", { ascending: false });
        if (conversationError) throw conversationError;
        const ids = (conversationRows ?? []).map(
          (conversation) => conversation.id,
        );
        const { data: messageRows, error: messagesError } = ids.length
          ? await supabase
              .from("messages")
              .select("*")
              .in("conversation_id", ids)
              .order("created_at", { ascending: true })
          : { data: [], error: null };
        if (messagesError) throw messagesError;
        if (cancelled) return;
        const mapped = (conversationRows ?? []).map((conversation) =>
          mapConversation(conversation, messageRows ?? []),
        );
        setConversations(mapped);
        setActiveId(mapped[0]?.id ?? null);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load private messages.",
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!client) return;
    const channel = client
      .channel("fan-private-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: RealtimePostgresChangesPayload<MessageRow>) => {
          const row = payload.new as MessageRow;
          if (!row.conversation_id) return;
          setConversations((current) =>
            current.map((conversation) => {
              if (
                conversation.id !== row.conversation_id ||
                conversation.messages.some((message) => message.id === row.id)
              )
                return conversation;
              return {
                ...conversation,
                messages: [...conversation.messages, mapMessage(row)],
                preview: row.content ?? conversation.preview,
                timestamp: displayTime(row.created_at),
                unread: row.sender !== "fan" ? true : conversation.unread,
              };
            }),
          );
        },
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [client]);

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ?? null;

  const handleSelect = (id: string) => {
    setActiveId(id);
    setMobileView("conversation");
  };

  const sendMessage = async (content: string) => {
    if (!client || !userId || !activeId) return false;
    const { error: sendError } = await client.from("messages").insert({
      conversation_id: activeId,
      sender_id: userId,
      sender_name: "Member",
      sender: "fan",
      content,
      type: "text",
    });
    if (sendError) {
      setError(sendError.message);
      return false;
    }
    setError("");
    return true;
  };

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
        background: "var(--surface)",
        height: "calc(100vh - 260px)",
        minHeight: "480px",
        display: "flex",
      }}
    >
      {/* Sidebar: Message List */}
      <div
        style={{
          width: "100%",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        className={`messages-sidebar ${mobileView === "conversation" ? "messages-sidebar-hidden" : ""}`}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Conversations
          </h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <MessageList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {/* Main: Conversation + Composer */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
        className={`messages-conversation ${mobileView === "list" ? "messages-conversation-hidden" : ""}`}
      >
        {activeConversation ? (
          <>
            {/* Conversation Header */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexShrink: 0,
              }}
            >
              {/* Mobile back button */}
              <button
                onClick={() => setMobileView("list")}
                aria-label="Back to messages"
                className="mobile-back-btn"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "0.25rem",
                  display: "none",
                }}
              >
                <IoChevronBackOutline size={20} />
              </button>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--purple-bg)",
                  border: "1px solid var(--purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--text-purple)",
                  flexShrink: 0,
                }}
              >
                M
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Midigo
                </p>
                <p
                  style={{ fontSize: "0.75rem", color: "var(--accent-strong)" }}
                >
                  Online now
                </p>
              </div>
            </div>

            <ConversationView messages={activeConversation.messages} />
            <MessageComposer onSend={sendMessage} />
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              {error ||
                (loading
                  ? "Loading messages…"
                  : "No private conversations yet.")}
            </p>
          </div>
        )}
        {error && activeConversation && (
          <p role="alert" style={{ color: "#b42318", padding: "0 1.5rem" }}>
            {error}
          </p>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .messages-sidebar { width: 300px !important; display: flex !important; }
          .messages-sidebar-hidden { display: flex !important; }
          .messages-conversation { display: flex !important; }
          .messages-conversation-hidden { display: flex !important; }
          .mobile-back-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .messages-sidebar-hidden { display: none !important; }
          .messages-conversation-hidden { display: none !important; }
          .mobile-back-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
