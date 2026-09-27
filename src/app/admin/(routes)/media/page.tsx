"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminModulePage from "@/src/components/admin/AdminModulePage";
import type { AdminDialogConfig } from "@/src/components/admin/adminTypes";
import MediaUploader from "@/components/ui/MediaUploader";
import { IoImageOutline } from "react-icons/io5";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDistanceToNow } from "date-fns";
import { upsertMediaAssetAction } from "@/app/admin/actions/upsertMediaAsset";

const mediaTone = (status: string) =>
  status === "published" ? "success" : status === "draft" ? "warning" : "default";

const dialogConfig: AdminDialogConfig = {
  icon: <IoImageOutline aria-hidden="true" />,
  createTitle: "Edit asset",
  createDescription:
    "Update asset details such as title, category, and visibility.",
  createLabel: "Save asset",
  editTitle: "Edit asset",
  editLabel: "Save changes",
  fields: [
    {
      key: "Asset",
      label: "Asset title",
      type: "text",
      placeholder: "e.g. Behind the scenes – Vol. 3",
    },
    {
      key: "Category",
      label: "Category",
      type: "select",
      options: ["Photos", "Videos", "Audio", "Documents", "Other"],
    },
    {
      key: "Visibility",
      label: "Visibility tier",
      type: "select",
      options: ["public", "members", "vip"],
    },
    {
      key: "Status",
      label: "Status",
      type: "select",
      options: ["draft", "published", "locked"],
    },
  ],
};

export default function AdminMediaPage() {
  const [records, setRecords] = useState<
    {
      id: string;
      title: string;
      subtitle: string;
      details: Record<string, string>;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (data && !error) {
          const formatted = data.map((media) => ({
            id: media.id,
            title: media.title,
            subtitle: media.category,
            details: {
              Asset: media.title,
              Category: media.category,
              Visibility: media.visibility,
              Status: media.status,
              Updated: media.updated_at
                ? formatDistanceToNow(new Date(media.updated_at), { addSuffix: true })
                : "N/A",
            },
          }));
          setRecords(formatted);
        }
      });
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <AdminModulePage
      actionLabel="Add media"
      columns={["Asset", "Category", "Visibility", "Status", "Updated", "Actions"]}
      description="Organize the gallery, control visibility, and keep published media easy to review."
      dialogConfig={dialogConfig}
      eyebrow="Gallery & media"
      filterByTab={(tab, record) => tab === "All" || record.details.Status.toLowerCase() === tab.toLowerCase()}
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="title">{record.details.Asset}</span>,
        <span className="admin-table-cell-secondary" key="category">{record.details.Category}</span>,
        <AdminBadge key="visibility" tone={record.details.Visibility === "vip" ? "accent" : record.details.Visibility === "members" ? "info" : "default"}>{record.details.Visibility}</AdminBadge>,
        <AdminBadge key="status" tone={mediaTone(record.details.Status)}>{record.details.Status}</AdminBadge>,
        <span className="admin-table-cell-secondary" key="updated">{record.details.Updated}</span>,
      ]}
      rowActionLabel="Lock"
      onRowAction={(record, actions) => {
        const nextStatus = record.details.Status === "locked" ? "published" : "locked";
        actions.update(record.id, { ...record.details, Status: nextStatus, Updated: "Just now" });
        return `${record.title} ${nextStatus === "locked" ? "locked" : "unlocked"}.`;
      }}
      onCreate={async (values) => {
        await upsertMediaAssetAction(values);
        fetchRecords();
      }}
      onUpdate={async (id, values) => {
        await upsertMediaAssetAction({ ...values, id });
        fetchRecords();
      }}
      searchPlaceholder="Search assets, categories, or visibility"
      tabs={["All", "Published", "Draft", "Locked"]}
      title="Gallery & media"
    >
      <div className="admin-section">
        <h3 style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Upload new media
        </h3>
        <MediaUploader onUploadSuccess={fetchRecords} />
      </div>
    </AdminModulePage>
  );
}
