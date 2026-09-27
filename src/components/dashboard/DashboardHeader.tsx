"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "name" | "handle" | "avatar_url" | "email"
>;

export default function DashboardHeader({
  initialProfile,
}: {
  initialProfile: Profile;
}) {
  const router = useRouter();
  const [profile] = useState<Profile>(initialProfile);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const handleSignOut = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/sign-in");
      router.refresh();
    } catch {
      setSignOutError("Sign out failed. Check your connection and try again.");
    }
  };

  const displayName =
    profile.name || profile.handle || profile.email.split("@")[0] || "Account";
  const displayEmail = profile.email;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        className="container"
        style={{
          height: "var(--nav-h)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Branding & Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link
            href="/dashboard"
            aria-label="Midigo Fan Dashboard"
            style={{
              fontSize: "1.3125rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            Midigo{" "}
            <span
              style={{
                color: "var(--purple)",
                fontWeight: 500,
                fontSize: "1rem",
              }}
            >
              Fan
            </span>
          </Link>
          <nav
            style={{ display: "none", gap: "1.5rem" }}
            className="dashboard-nav"
          >
            <Link
              href="/dashboard"
              className="nav-link active"
              style={{
                color: "var(--text-primary)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Overview
            </Link>
            <Link
              href="/dashboard/galleries"
              className="nav-link"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Galleries
            </Link>
            <Link
              href="/dashboard/live-chats"
              className="nav-link"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Live Chats
            </Link>
            <Link
              href="/dashboard/messages"
              className="nav-link"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Messages
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              aria-label="Notifications"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IoNotificationsOutline size={20} strokeWidth={1.5} />
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "6px",
                  width: "8px",
                  height: "8px",
                  background: "var(--accent-strong)",
                  borderRadius: "50%",
                }}
              ></span>
            </button>
            {notificationsOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  width: "300px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "1rem",
                  boxShadow: "0 10px 40px var(--shadow)",
                }}
              >
                <p className="label" style={{ marginBottom: "0.5rem" }}>
                  Notifications
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Midigo goes live in 2 hours.
                </p>
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              aria-label="Profile menu"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-mid)",
                color: "var(--text-primary)",
                cursor: "pointer",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {initials}
            </button>
            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "200px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  boxShadow: "0 10px 40px var(--shadow)",
                }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    borderBottom: "1px solid var(--border-mid)",
                    marginBottom: "0.5rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                    }}
                  >
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {displayEmail}
                    </p>
                  )}
                </div>
                <Link
                  href="/dashboard/settings"
                  style={{
                    display: "block",
                    padding: "0.5rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  Settings
                </Link>
                {signOutError && (
                  <p
                    role="alert"
                    style={{
                      padding: "0.5rem",
                      color: "#b42318",
                      fontSize: "0.75rem",
                    }}
                  >
                    {signOutError}
                  </p>
                )}
                <button
                  onClick={handleSignOut}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.5rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .dashboard-nav { display: flex !important; }
        }
        .nav-link:hover { color: var(--text-primary) !important; }
      `}</style>
    </header>
  );
}
