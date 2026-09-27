"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminModulePage from "@/src/components/admin/AdminModulePage";
import type { AdminDialogConfig } from "@/src/components/admin/adminTypes";
import { IoCreateOutline } from "react-icons/io5";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDistanceToNow } from "date-fns";
import { upsertContentAction } from "@/app/admin/actions/upsertContent";

const contentTone = (status: string) =>
  status === "published" ? "success" : status === "scheduled" ? "info" : "warning";

type RecordType = {
  id: string;
  title: string;
  subtitle: string;
  details: Record<string, string>;
};

const dialogConfig: AdminDialogConfig = {
  icon: <IoCreateOutline aria-hidden="true" />,
  createTitle: "Create article",
  createDescription:
    "Draft a new piece of content for the community. Set the type, category, and author before publishing.",
  createLabel: "Create article",
  editTitle: "Edit article",
  editLabel: "Save changes",
  fields: [
    {
      key: "Title",
      label: "Article title",
      type: "text",
      placeholder: "e.g. What's new this season",
    },
    {
      key: "Type",
      label: "Content type",
      type: "select",
      options: ["Article", "Announcement", "Update", "Interview", "Behind the scenes", "Playlist"],
    },
    {
      key: "Category",
      label: "Category",
      type: "select",
      options: ["Music", "Events", "Community", "Merch", "Tour", "Exclusive"],
    },
    {
      key: "Author",
      label: "Author",
      type: "text",
      placeholder: "e.g. Team Midigo",
    },
    {
      key: "Status",
      label: "Publish status",
      type: "select",
      options: ["draft", "scheduled", "published"],
    },
  ],
};

export default function AdminContentPage() {
  const [records, setRecords] = useState<RecordType[]>([]);

  const fetchContent = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("content_articles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (data && !error) {
          const formatted = data.map((article) => ({
            id: article.id,
            title: article.title,
            subtitle: article.category,
            details: {
              Title: article.title,
              Type: article.type,
              Category: article.category,
              Status: article.status,
              Author: article.author_name,
              Updated: article.updated_at
                ? formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })
                : "N/A",
            },
          }));
          setRecords(formatted);
        }
      });
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <AdminModulePage
      actionLabel="Create article"
      columns={["Title", "Type", "Category", "Status", "Author", "Updated", "Actions"]}
      description="Plan, draft, schedule, and publish the stories that keep the community connected."
      dialogConfig={dialogConfig}
      eyebrow="Content & news"
      filterByTab={(tab, record) => tab === "All" || record.details.Status.toLowerCase() === tab.toLowerCase()}
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="title">{record.details.Title}</span>,
        <span className="admin-table-cell-secondary" key="type">{record.details.Type}</span>,
        <span className="admin-table-cell-secondary" key="category">{record.details.Category}</span>,
        <AdminBadge key="status" tone={contentTone(record.details.Status)}>{record.details.Status}</AdminBadge>,
        <span className="admin-table-cell-secondary" key="author">{record.details.Author}</span>,
        <span className="admin-table-cell-secondary" key="updated">{record.details.Updated}</span>,
      ]}
      rowActionLabel="Publish"
      onRowAction={(record, actions) => {
        const nextStatus = record.details.Status === "published" ? "draft" : "published";
        actions.update(record.id, { ...record.details, Status: nextStatus, Updated: "Just now" });
        return `${record.title} ${nextStatus === "published" ? "published" : "moved to draft"}.`;
      }}
      onCreate={async (values) => {
        await upsertContentAction(values);
        fetchContent();
      }}
      onUpdate={async (id, values) => {
        await upsertContentAction({ ...values, id });
        fetchContent();
      }}
      searchPlaceholder="Search articles, types, or categories"
      tabs={["All", "Published", "Draft", "Scheduled"]}
      title="Content & news"
    />
  );
}
