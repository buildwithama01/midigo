"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/chatter", label: "Overview", description: "Queue and room pulse" },
  {
    href: "/chatter/conversations",
    label: "Conversations",
    description: "Assigned member messages",
  },
  {
    href: "/chatter/live",
    label: "Live rooms",
    description: "Monitor and reply",
  },
  {
    href: "/chatter/moderation",
    label: "Moderation",
    description: "Review flagged activity",
  },
];

export default function ChatterSidebar({
  mobileNavOpen,
  onClose,
  onNavigate,
}: {
  mobileNavOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileNavOpen && (
        <button
          aria-label="Close navigation"
          className="chatter-sidebar-backdrop"
          onClick={onClose}
          type="button"
        />
      )}
      <aside
        aria-label="Chatter navigation"
        className={`chatter-sidebar ${mobileNavOpen ? "chatter-sidebar-open" : ""}`}
      >
        <div className="chatter-sidebar-heading">
          <span className="label label-purple">Workspace</span>
          <button aria-label="Close navigation" className="chatter-sidebar-close" onClick={onClose} type="button">
            ×
          </button>
        </div>
        <nav className="chatter-sidebar-nav">
          {navigation.map((item) => {
            const active =
              item.href === "/chatter"
                ? pathname === "/chatter"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`chatter-nav-item ${active ? "chatter-nav-item-active" : ""}`}
                href={item.href}
                key={item.href}
                onClick={() => {
                  onClose();
                  onNavigate();
                }}
              >
                <span>{item.label}</span>
                <small>{item.description}</small>
              </Link>
            );
          })}
        </nav>

        <div className="chatter-sidebar-note">
          <span className="chatter-note-icon">i</span>
          <div>
            <strong>Prototype workspace</strong>
            <p>Seed data is local to this browser session.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
