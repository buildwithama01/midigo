"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import CannedReplyBar from "./CannedReplyBar";
import ChatterComposer from "./ChatterComposer";
import ChatterPageHeader from "./ChatterPageHeader";
import ConversationList from "./ConversationList";
import ConversationThread from "./ConversationThread";
import type { ChatterMessage, Conversation } from "./chatterTypes";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ChatterWithConversations = {
  id: string;
  conversations: ConversationRow[];
};
type Profile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "name" | "handle" | "role"
>;
type Supabase = ReturnType<typeof createClient>;

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function displayTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function mapMessage(row: MessageRow): ChatterMessage {
  return {
    id: row.id,
    from: row.sender,
    content: row.content ?? "",
    timestamp: displayTime(row.created_at),
    read: row.read,
  };
}

function mapConversation(
  row: ConversationRow,
  messageRows: MessageRow[],
): Conversation {
  const thread = messageRows.filter(
    (message) => message.conversation_id === row.id,
  );
  const latest = thread[thread.length - 1];
  return {
    id: row.id,
    fanName: row.fan_name,
    avatar: initials(row.fan_name),
    online: false,
    unread: thread.filter(
      (message) => !message.read && message.sender === "fan",
    ).length,
    priority: "standard",
    preview: latest?.content ?? row.subject,
    timestamp: latest
      ? displayTime(latest.created_at)
      : displayTime(row.updated_at),
    messages: thread.map(mapMessage),
  };
}

export default function ConversationsClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "conversation">("list");
  const [draft, setDraft] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [client, setClient] = useState<Supabase | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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

        const [
          { data: currentProfile },
          // Find the chatter row for this user, then load only their assigned
          // conversations via the foreign-table join.
          { data: chatterRows, error: chatterError },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, name, handle, role")
            .eq("id", authData.user.id)
            .maybeSingle(),
          supabase
            .from("chatters")
            .select(
              "id, conversations!inner(id, fan_id, fan_name, subject, status, message_count, created_at, updated_at)",
            )
            .eq("profile_id", authData.user.id) as unknown as Promise<{
            data: ChatterWithConversations[] | null;
            error: { message: string } | null;
          }>,
        ]);
        if (chatterError) throw chatterError;
        if (cancelled) return;
        setProfile(currentProfile);

        // Flatten nested conversations from the chatters join
        const conversationRows =
          chatterRows?.flatMap((chatter) => chatter.conversations ?? []) ?? [];
        const ids = conversationRows.map((row) => row.id);
        const { data: messageRows, error: messagesError } = ids.length
          ? await supabase
              .from("messages")
              .select("*")
              .in("conversation_id", ids)
              .order("created_at", { ascending: true })
          : { data: [], error: null };
        if (messagesError) throw messagesError;
        if (cancelled) return;
        const mapped = conversationRows.map((row) =>
          mapConversation(row, messageRows ?? []),
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
              : "Could not load conversations.",
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
    const messagesChannel = client
      .channel("assigned-conversation-messages")
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
                unread:
                  row.sender === "fan"
                    ? conversation.unread + 1
                    : conversation.unread,
              };
            }),
          );
        },
      )
      .subscribe();
    const conversationsChannel = client
      .channel("assigned-conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          void client
            .from("conversations")
            .select("*")
            .order("updated_at", { ascending: false })
            .then(({ data }) => {
              if (!data) return;
              setConversations((current) =>
                data.map(
                  (row) =>
                    current.find((item) => item.id === row.id) ??
                    mapConversation(row, []),
                ),
              );
            });
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(messagesChannel);
      void client.removeChannel(conversationsChannel);
    };
  }, [client]);

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return conversations;
    return conversations.filter((conversation) =>
      `${conversation.fanName} ${conversation.preview}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [conversations, query]);

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ?? null;

  const selectConversation = (id: string) => {
    setActiveId(id);
    setMobileView("conversation");
  };

  const sendMessage = async (content: string) => {
    if (!client || !profile || !activeId) return;
    const sender =
      profile.role === "chatter"
        ? "chatter"
        : profile.role === "fan"
          ? "fan"
          : "midigo";
    const { error: sendError } = await client.from("messages").insert({
      conversation_id: activeId,
      sender_id: profile.id,
      sender_name: profile.name || profile.handle || "Team Midigo",
      sender,
      content,
      type: "text",
    });
    if (sendError) setError(sendError.message);
  };

  return (
    <div className="chatter-conversations-page">
      <ChatterPageHeader
        eyebrow="Member support"
        title="Assigned conversations"
        description="Search your queue, respond to fans, and keep every conversation moving."
      />

      <div className="chatter-conversation-toolbar">
        <label className="chatter-search-field">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search conversations</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or message..."
            type="search"
            value={query}
          />
        </label>
        <span className="chatter-toolbar-count">
          {filteredConversations.length} assigned
        </span>
      </div>

      <div
        className={`chatter-conversation-console ${mobileView === "conversation" ? "chatter-conversation-console-mobile" : ""}`}
      >
        <section
          className="chatter-conversation-sidebar"
          aria-label="Conversation list"
        >
          <div className="chatter-conversation-sidebar-heading">
            <div>
              <p className="label">Your queue</p>
              <strong>
                {conversations.reduce((total, item) => total + item.unread, 0)}{" "}
                unread
              </strong>
            </div>
            <button
              aria-label="Back to conversation list"
              className="chatter-mobile-back"
              onClick={() => setMobileView("list")}
              type="button"
            >
              Back
            </button>
          </div>
          {loading ? (
            <p className="chatter-empty-state">Loading conversations…</p>
          ) : (
            <ConversationList
              activeId={activeId}
              conversations={filteredConversations}
              onSelect={selectConversation}
            />
          )}
        </section>

        <section className="chatter-conversation-main">
          {activeConversation ? (
            <>
              <ConversationThread
                conversation={activeConversation}
                onSendMessage={sendMessage}
              />
              <CannedReplyBar onInsert={setDraft} />
              <ChatterComposer
                onSend={sendMessage}
                onValueChange={setDraft}
                placeholder={`Reply to ${activeConversation.fanName}...`}
                value={draft}
              />
            </>
          ) : (
            <div className="chatter-empty-state chatter-conversation-empty">
              <strong>
                {error
                  ? "Conversation unavailable"
                  : "No conversations assigned"}
              </strong>
              <p>
                {error ||
                  (loading
                    ? "Loading your queue…"
                    : "New member conversations will appear here.")}
              </p>
            </div>
          )}
          {error && activeConversation && (
            <p className="chatter-empty-state" role="alert">
              {error}
            </p>
          )}
        </section>
      </div>

      <style>{`
        @media (min-width: 820px) {
          .chatter-conversation-console {
            grid-template-columns: minmax(260px, 330px) minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
