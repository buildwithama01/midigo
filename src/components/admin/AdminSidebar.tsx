"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";

type NavigationItem = {
  href: string;
  label: string;
  description: string;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const baseNavigation: NavigationGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", description: "Platform at a glance" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/users", label: "Users", description: "Accounts and access" },
      { href: "/admin/fans", label: "Fans", description: "Community members" },
      { href: "/admin/chatter", label: "Chatter", description: "Agents and queues" },
      { href: "/admin/messages", label: "Messages", description: "Conversations" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/media", label: "Gallery & media", description: "Assets and collections" },
      { href: "/admin/live-rooms", label: "Live rooms", description: "Rooms and sessions" },
      { href: "/admin/content", label: "Content & news", description: "Publishing pipeline" },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        href: "/admin/memberships-payments",
        label: "Memberships & payments",
        description: "Plans and revenue",
      },
    ],
  },
  {
    label: "Safety",
    items: [
      { href: "/admin/moderation", label: "Moderation", description: "Cases and actions" },
      {
        href: "/admin/roles-permissions",
        label: "Roles & permissions",
        description: "Access control",
      },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/admin/analytics", label: "Reports & analytics", description: "Performance" },
      { href: "/admin/audit-logs", label: "Audit logs", description: "System history" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", description: "Platform configuration" },
    ],
  },
];

/**
 * Filter navigation items based on the user's role.
 * - "moderator" and above can see Moderation and Audit logs
 * - "administrator" only can see Roles & permissions and Settings
 */
function filterNavigation(
  navigation: NavigationGroup[],
  role: string | null,
): NavigationGroup[] {
  if (!role) return navigation; // show everything if role unknown (server will block)

  return navigation.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      // Roles & permissions — administrators only
      if (item.href === "/admin/roles-permissions") {
        return role === "administrator";
      }
      // Settings — administrators only
      if (item.href === "/admin/settings") {
        return role === "administrator";
      }
      // Moderation and Audit logs — moderators and above
      if (item.href === "/admin/moderation" || item.href === "/admin/audit-logs") {
        return ["moderator", "editor", "administrator"].includes(role);
      }
      return true;
    }),
  })).filter((group) => group.items.length > 0);
}

export default function AdminSidebar({
  mobileNavOpen,
  onClose,
}: {
  mobileNavOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { role, loading } = usePermissions();

  if (loading) {
    return null; // don't render sidebar until role is known
  }

  const navigation = filterNavigation(baseNavigation, role);

  return (
    <>
      {mobileNavOpen && (
        <button
          aria-label="Close navigation"
          className="admin-sidebar-backdrop"
          onClick={onClose}
          type="button"
        />
      )}
      <aside
        aria-label="Admin navigation"
        className={`admin-sidebar ${mobileNavOpen ? "admin-sidebar-open" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onClose();
          }
        }}
      >
        <div className="admin-sidebar-heading">
          <span className="admin-label">Admin workspace</span>
          <button
            aria-label="Close navigation"
            className="admin-sidebar-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <nav>
          {navigation.map((group) => (
            <section className="admin-sidebar-group" key={group.label}>
              <h2 className="admin-sidebar-group-label">{group.label}</h2>
              <div className="admin-sidebar-nav">
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={`admin-nav-item ${active ? "admin-nav-item-active" : ""}`}
                      href={item.href}
                      key={item.href}
                      onClick={onClose}
                    >
                      <span>{item.label}</span>
                      <small>{item.description}</small>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="admin-sidebar-note">
          <strong>Prototype workspace</strong>
          <p>Admin records use local seed data and do not change fan-facing content.</p>
        </div>
      </aside>
    </>
  );
}
