"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminModulePage from "@/src/components/admin/AdminModulePage";
import type { AdminDialogConfig } from "@/src/components/admin/adminTypes";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDistanceToNow } from "date-fns";
import { updateProfileAdminAction } from "@/app/admin/actions/upsertProfile";

const statusTone = (status: string) =>
  status === "active" || status === "Active"
    ? "success"
    : status === "pending" || status === "Pending"
      ? "warning"
      : "danger";

type UserRecord = {
  id: string;
  title: string;
  subtitle: string;
  details: {
    Name: string;
    Email: string;
    Role: string;
    Membership: string;
    Status: string;
    "Last active": string;
  };
};

const dialogConfig: AdminDialogConfig = {
  editTitle: "Edit user",
  editLabel: "Save changes",
  fields: [
    {
      key: "Name",
      label: "Full name",
      type: "text",
      placeholder: "e.g. Alex Rivera",
    },
    {
      key: "Email",
      label: "Email address",
      type: "email",
      placeholder: "e.g. alex@example.com",
    },
    {
      key: "Role",
      label: "Workspace role",
      type: "select",
      options: ["Fan", "Chatter", "Moderator", "Editor", "Administrator"],
    },
    {
      key: "Membership",
      label: "Membership tier",
      type: "select",
      options: ["Free", "Standard", "VIP", "Lifetime"],
    },
    {
      key: "Status",
      label: "Account status",
      type: "select",
      options: ["Active", "Pending", "Suspended"],
    },
  ],
};

export default function AdminUsersPage() {
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await createClient()
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    setError("");
    setRecords(
      (data ?? []).map((user) => ({
        id: user.id,
        title: user.name || user.email,
        subtitle: user.email,
        details: {
          Name: user.name || "Name not provided",
          Email: user.email,
          Role: user.role,
          Membership: user.membership,
          Status: user.status,
          "Last active": user.updated_at
            ? formatDistanceToNow(new Date(user.updated_at), {
                addSuffix: true,
              })
            : "—",
        },
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchUsers);
  }, [fetchUsers]);

  return (
    <AdminModulePage
      allowCreate={false}
      columns={[
        "Name",
        "Email",
        "Role",
        "Membership",
        "Status",
        "Last active",
        "Actions",
      ]}
      description="Manage accounts, membership access, and workspace roles from one place."
      dialogConfig={dialogConfig}
      eyebrow="User management"
      filterByTab={(tab, record) =>
        tab === "All" || record.details.Status === tab.toLowerCase()
      }
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="name">
          {record.details.Name}
        </span>,
        <span className="admin-table-cell-secondary" key="email">
          {record.details.Email}
        </span>,
        <span className="admin-table-cell-secondary" key="role">
          {record.details.Role}
        </span>,
        <span className="admin-table-cell-secondary" key="membership">
          {record.details.Membership}
        </span>,
        <AdminBadge key="status" tone={statusTone(record.details.Status)}>
          {record.details.Status}
        </AdminBadge>,
        <span className="admin-table-cell-secondary" key="active">
          {record.details["Last active"]}
        </span>,
      ]}
      rowActionLabel="Restrict"
      onRowAction={(record, actions) => {
        const nextStatus =
          record.details.Status === "suspended" ? "active" : "suspended";
        actions.update(record.id, {
          ...record.details,
          Status: nextStatus,
          "Last active": "Just now",
        });
        return `${record.title} ${nextStatus === "suspended" ? "suspended" : "reactivated"}.`;
      }}
      onUpdate={async (id, values) => {
        await updateProfileAdminAction({ ...values, id });
        fetchUsers();
      }}
      searchPlaceholder="Search users by name, email, or role"
      tabs={["All", "Active", "Pending", "Suspended"]}
      title="Users"
    >
      {loading && (
        <p className="admin-table-cell-secondary">Loading accounts…</p>
      )}
      {error && (
        <p className="admin-empty-state" role="alert">
          Could not load accounts: {error}
        </p>
      )}
    </AdminModulePage>
  );
}
