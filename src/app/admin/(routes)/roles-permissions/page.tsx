"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminModulePage from "@/src/components/admin/AdminModulePage";
import type { AdminDialogConfig } from "@/src/components/admin/adminTypes";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type RecordType = {
  id: string;
  title: string;
  subtitle: string;
  details: Record<string, string>;
};

const dialogConfig: AdminDialogConfig = {
  icon: <IoShieldCheckmarkOutline aria-hidden="true" />,
  createTitle: "Create role",
  createDescription:
    "Define a new access role with a scoped permission set. Roles follow least-privilege by default.",
  createLabel: "Create role",
  editTitle: "Edit role",
  editLabel: "Save changes",
  fields: [
    {
      key: "Role",
      label: "Role name",
      type: "text",
      placeholder: "e.g. Community Moderator",
    },
    {
      key: "Description",
      label: "Description",
      type: "textarea",
      placeholder: "Briefly describe what this role is responsible for…",
    },
    {
      key: "Permissions",
      label: "Permissions",
      type: "textarea",
      placeholder: "e.g. View content · Moderate comments · Manage live rooms",
    },
    {
      key: "Members",
      label: "Initial member count",
      type: "text",
      placeholder: "0",
    },
  ],
};

export default function AdminRolesPage() {
  const [records, setRecords] = useState<RecordType[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("roles").select("*"),
      supabase.from("role_permissions").select("*"),
    ]).then(([rolesRes, permissionsRes]) => {
      const roles = rolesRes.data;
      const permissions = permissionsRes.data;
      if (roles && permissions) {
        const permissionsByRole = new Map<string, string[]>();
        permissions.forEach((perm) => {
          const arr = permissionsByRole.get(perm.role_id) ?? [];
          arr.push(perm.permission);
          permissionsByRole.set(perm.role_id, arr);
        });

        const formatted = roles.map((role) => ({
          id: role.id,
          title: role.name,
          subtitle: role.description,
          details: {
            Role: role.name,
            Description: role.description,
            Members: String(role.member_count ?? 0),
            Permissions: (permissionsByRole.get(role.id) ?? []).join(" · ") || "None",
          },
        }));
        setRecords(formatted);
      }
    });
  }, []);

  return (
    <AdminModulePage
      actionLabel="Create role"
      columns={["Role", "Description", "Members", "Permissions", "Actions"]}
      description="Define access boundaries for administrators, moderators, editors, and support."
      dialogConfig={dialogConfig}
      eyebrow="Roles & permissions"
      filterByTab={(tab, record) => tab === "All" || record.details.Role === tab}
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="name">{record.details.Role}</span>,
        <span className="admin-table-cell-secondary" key="description">{record.details.Description}</span>,
        <span className="admin-table-cell-secondary" key="members">{record.details.Members}</span>,
        <span className="admin-table-cell-secondary" key="permissions">{record.details.Permissions}</span>,
      ]}
      rowActionMode="edit"
      rowActionLabel="Edit"
      searchPlaceholder="Search roles or permissions"
      tabs={["All", "Administrator", "Moderator", "Editor", "Support"]}
      title="Roles & permissions"
    >
      <div className="admin-module-grid">
        <section className="admin-panel">
          <header className="admin-panel-heading">
            <div><span className="admin-label">Permission model</span><h2>Least-privilege by default</h2></div>
            <AdminBadge tone="info">{records.length} role types</AdminBadge>
          </header>
          <div className="admin-panel-body">
            <p className="admin-table-cell-secondary">Roles are grouped by operational responsibility. Permission changes should be reviewed in the audit log before they are shared with a wider team.</p>
          </div>
        </section>
        <section className="admin-panel">
          <header className="admin-panel-heading">
            <div><span className="admin-label">Access review</span><h2>Quarterly check-in</h2></div>
            <AdminBadge tone="warning">Due soon</AdminBadge>
          </header>
          <div className="admin-panel-body">
            <p className="admin-table-cell-secondary">Review dormant accounts and confirm that elevated permissions still match each teammate&apos;s current responsibility.</p>
          </div>
        </section>
      </div>
    </AdminModulePage>
  );
}
