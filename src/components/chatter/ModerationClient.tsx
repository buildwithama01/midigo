"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { useChatterWorkspace } from "./ChatterWorkspaceContext";
import FlaggedItems from "./FlaggedItems";
import ModerationActions from "./ModerationActions";
import ModerationActivity from "./ModerationActivity";
import ChatterPageHeader from "./ChatterPageHeader";
import type { ModerationAction, ModerationAuditEvent, ModerationCase } from "./chatterTypes";

type ModerationCaseRow = Database["public"]["Tables"]["moderation_cases"]["Row"];
type AuditEventRow = Database["public"]["Tables"]["audit_events"]["Row"];

function mapAuditEvent(row: AuditEventRow): ModerationAuditEvent {
  const action = row.action as ModerationAction;
  const details =
    typeof row.metadata === "object" && row.metadata !== null
      ? (row.metadata as { details?: string }).details ?? row.action
      : row.action;

  return {
    id: row.id,
    action,
    target: row.target,
    details,
    timestamp: new Date(row.created_at).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }),
  };
}

function formatRelative(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function mapCaseForAudit(row: ModerationCaseRow): ModerationCase {
  return {
    id: row.id,
    roomId: row.id,
    participantId: row.assigned_to ?? row.id,
    participantName: row.target,
    message: "",
    reason: row.reason,
    severity: row.severity,
    status: row.status === "resolved" ? "resolved" : "open",
    createdAt: formatRelative(row.created_at),
  };
}

export default function ModerationClient() {
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [audit, setAudit] = useState<ModerationAuditEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileCaseOpen, setMobileCaseOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const { notify } = useChatterWorkspace();

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve()
      .then(() => createClient())
      .then(async (supabase) => {
        if (cancelled) return;

        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          if (cancelled) return;
          setError("Sign in to view moderation tools.");
          setLoading(false);
          return;
        }

        setUserId(authData.user.id);

        const [casesResult, auditResult] = await Promise.all([
          supabase
            .from("moderation_cases")
            .select("*")
            .eq("assigned_to", authData.user.id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("audit_events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        if (cancelled) return;

        const mappedCases = (casesResult.data ?? []).map(mapCaseForAudit);
        setCases(mappedCases);
        setSelectedId((current) => current ?? mappedCases[0]?.id ?? null);

        setAudit((auditResult.data ?? []).map(mapAuditEvent));
        setError("");
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load moderation data.",
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleCases = useMemo(
    () => cases.filter((item) => filter === "all" || item.status === filter),
    [cases, filter],
  );
  const selectedCase = cases.find((item) => item.id === selectedId) ?? visibleCases[0] ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMobileCaseOpen(true);
  };

  const handleAction = async (action: ModerationAction) => {
    if (!selectedCase || !userId) return;
    const actionLabels: Record<ModerationAction, string> = {
      warned: "Warning sent",
      "message-deleted": "Message deleted",
      "timed-out": "Member timed out",
      banned: "Member banned",
      resolved: "Case resolved",
    };

    setCases((current) =>
      current.map((item) =>
        item.id === selectedCase.id && action === "resolved"
          ? { ...item, status: "resolved" }
          : item,
      ),
    );

    const event: ModerationAuditEvent = {
      id: `audit-${Date.now()}`,
      action,
      target: selectedCase.participantName,
      details: action === "resolved"
        ? `Closed the ${selectedCase.severity}-severity case.`
        : `Applied ${action.replace("-", " ")} to the flagged content.`,
      timestamp: "Just now",
    };
    setAudit((current) => [event, ...current]);

    // Write audit event to Supabase
    const supabase = createClient();
    await supabase.from("audit_events").insert({
      actor: userId,
      action,
      target: selectedCase.participantName,
      outcome: "success",
      metadata: { details: event.details },
    });

    notify(`${actionLabels[action]} for ${selectedCase.participantName}.`);
  };

  return (
    <div className="chatter-moderation-page">
      <ChatterPageHeader
        eyebrow="Community care"
        title="Moderation"
        description="Review flagged messages, protect the room, and keep every decision accountable."
      />

      {error && (
        <p role="alert" className="chatter-empty-state">
          {error}
        </p>
      )}

      <div className="chatter-moderation-toolbar">
        <div className="chatter-filter-tabs" role="tablist" aria-label="Moderation filters">
          {(["all", "open", "resolved"] as const).map((value) => (
            <button
              aria-selected={filter === value}
              className={filter === value ? "is-active" : ""}
              key={value}
              onClick={() => setFilter(value)}
              role="tab"
              type="button"
            >
              {value === "all" ? "All cases" : value[0].toUpperCase() + value.slice(1)}
              <span>{value === "all" ? cases.length : cases.filter((item) => item.status === value).length}</span>
            </button>
          ))}
        </div>
        <span className="chatter-moderation-queue-count">
          {cases.filter((item) => item.status === "open").length} open
        </span>
      </div>

      {loading && (
        <p className="admin-table-cell-secondary" style={{ marginTop: "1rem" }}>
          Loading moderation cases…
        </p>
      )}

      <div
        className={`chatter-moderation-workspace ${
          mobileCaseOpen ? "chatter-moderation-workspace-mobile" : ""
        }`}
      >
        <section className="chatter-flagged-column" aria-label="Flagged cases">
          <FlaggedItems cases={visibleCases} onSelect={handleSelect} selectedId={selectedCase?.id ?? null} />
        </section>
        <section className="chatter-moderation-review-column">
          {selectedCase ? (
            <ModerationActions item={selectedCase} onAction={handleAction} />
          ) : (
            <div className="chatter-empty-state">
              <strong>Select a case to review</strong>
              <p>Choose a flagged item to see the available response actions.</p>
            </div>
          )}
          <ModerationActivity events={audit} />
        </section>
      </div>
    </div>
  );
}
