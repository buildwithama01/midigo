"use client";

import AdminModulePage from "@/components/admin/AdminModulePage";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";
import { formatDistanceToNow } from "date-fns";

type FanProfile = Database["public"]["Tables"]["profiles"]["Row"];
type FanRecord = {
  id: string;
  title: string;
  subtitle: string;
  details: Record<string, string>;
};

export default function AdminFansPage() {
  const [records, setRecords] = useState<FanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFans = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await createClient()
      .from("profiles")
      .select("*")
      .eq("role", "fan")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    setError("");
    setRecords(
      (data ?? []).map((fan: FanProfile) => ({
        id: fan.id,
        title: fan.name || fan.email,
        subtitle: fan.email,
        details: {
          Fan: fan.name || "Name not provided",
          Email: fan.email,
          Handle: fan.handle || "—",
          Membership: fan.membership,
          Status: fan.status,
          Joined: fan.created_at
            ? formatDistanceToNow(new Date(fan.created_at), { addSuffix: true })
            : "—",
        },
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchFans();
  }, [fetchFans]);

  return (
    <AdminModulePage
      allowCreate={false}
      columns={["Fan", "Email", "Handle", "Membership", "Status", "Joined"]}
      description="Registered fan accounts, membership tiers, and account status. Fans create their own accounts."
      eyebrow="Fan accounts"
      filterByTab={(tab, record) =>
        tab === "All" ||
        record.details.Status.toLowerCase() === tab.toLowerCase()
      }
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="name">
          {record.details.Fan}
        </span>,
        <span className="admin-table-cell-secondary" key="email">
          {record.details.Email}
        </span>,
        <span className="admin-table-cell-secondary" key="handle">
          {record.details.Handle}
        </span>,
        <span className="admin-table-cell-secondary" key="membership">
          {record.details.Membership}
        </span>,
        <span className="admin-table-cell-secondary" key="status">
          {record.details.Status}
        </span>,
        <span className="admin-table-cell-secondary" key="joined">
          {record.details.Joined}
        </span>,
      ]}
      searchPlaceholder="Search registered fans by name, email, or handle"
      tabs={["All", "Active", "Pending", "Suspended"]}
      title="Fans"
    >
      {loading && (
        <p className="admin-table-cell-secondary">Loading registered fans…</p>
      )}
      {error && (
        <p className="admin-empty-state" role="alert">
          Could not load registered fans: {error}
        </p>
      )}
    </AdminModulePage>
  );
}
