"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminModulePage from "@/src/components/admin/AdminModulePage";
import type { AdminDialogConfig } from "@/src/components/admin/adminTypes";
import { IoCardOutline } from "react-icons/io5";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDistanceToNow } from "date-fns";
import { upsertMembershipAction } from "@/app/admin/actions/upsertMembership";

const membershipTone = (status: string) =>
  status === "active" ? "success" : status === "past_due" ? "warning" : "default";

type RecordType = {
  id: string;
  title: string;
  subtitle: string;
  details: Record<string, string>;
};

const dialogConfig: AdminDialogConfig = {
  icon: <IoCardOutline aria-hidden="true" />,
  createTitle: "Record payment",
  createDescription:
    "Log a manual payment or create a membership entry. Use this for off-platform transactions or gift memberships.",
  createLabel: "Record payment",
  editTitle: "Edit membership",
  editLabel: "Save changes",
  fields: [
    {
      key: "Member",
      label: "Member name",
      type: "text",
      placeholder: "e.g. Priya Kapoor",
    },
    {
      key: "Plan",
      label: "Membership plan",
      type: "text",
      placeholder: "e.g. VIP Monthly",
    },
    {
      key: "Amount",
      label: "Payment amount",
      type: "text",
      placeholder: "e.g. $29.99",
    },
    {
      key: "Status",
      label: "Payment status",
      type: "select",
      options: ["active", "past_due", "cancelled", "refunded"],
    },
    {
      key: "Renewal",
      label: "Renewal date",
      type: "text",
      placeholder: "e.g. Jan 2026",
    },
  ],
};

export default function AdminMembershipsPage() {
  const [records, setRecords] = useState<RecordType[]>([]);

  const fetchMemberships = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("memberships")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (data && !error) {
          const formatted = data.map((membership) => ({
            id: membership.id,
            title: membership.member_name,
            subtitle: membership.plan,
            details: {
              Member: membership.member_name ?? "Unknown",
              Plan: membership.plan,
              Amount: `$${(membership.amount_cents / 100).toFixed(2)}`,
              Status: membership.status,
              Renewal: membership.renewal_at
                ? formatDistanceToNow(new Date(membership.renewal_at), { addSuffix: true })
                : "N/A",
            },
          }));
          setRecords(formatted);
        }
      });
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  return (
    <AdminModulePage
      actionLabel="Record payment"
      columns={["Member", "Plan", "Amount", "Status", "Renewal", "Actions"]}
      description="Track plans, renewals, and payment health without leaving the Admin workspace."
      dialogConfig={dialogConfig}
      eyebrow="Memberships & payments"
      filterByTab={(tab, record) => tab === "All" || record.details.Status.toLowerCase() === tab.toLowerCase()}
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="member">{record.details.Member}</span>,
        <span className="admin-table-cell-secondary" key="plan">{record.details.Plan}</span>,
        <span className="admin-table-cell-secondary" key="amount">{record.details.Amount}</span>,
        <AdminBadge key="status" tone={membershipTone(record.details.Status)}>{record.details.Status}</AdminBadge>,
        <span className="admin-table-cell-secondary" key="renewal">{record.details.Renewal}</span>,
      ]}
      rowActionLabel="Renew"
      onRowAction={(record, actions) => {
        const alreadyActive = record.details.Status === "active";
        actions.update(record.id, {
          ...record.details,
          Status: "active",
          Renewal: alreadyActive ? record.details.Renewal : "Next cycle",
        });
        return alreadyActive
          ? `${record.title} already has an active membership.`
          : `Renewal recorded for ${record.title}.`;
      }}
      onCreate={async (values) => {
        await upsertMembershipAction(values);
        fetchMemberships();
      }}
      onUpdate={async (id, values) => {
        await upsertMembershipAction({ ...values, id });
        fetchMemberships();
      }}
      searchPlaceholder="Search members, plans, or payment status"
      tabs={["All", "Active", "Past due", "Cancelled"]}
      title="Memberships & payments"
    />
  );
}
