"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoNotificationsOutline, IoLogOutOutline } from "react-icons/io5";
import { createClient } from "@/src/lib/supabase/client";
import { isSupabaseConfigured } from "@/src/lib/supabase/config";
import { getPublicUrlBrowser } from "@/lib/supabase/browserStorage";
import { getRoleLabel } from "@/lib/supabase/roles";

export default function AdminHeader({
  mobileNavOpen,
  onMobileNavChange,
}: {
  mobileNavOpen: boolean;
  onMobileNavChange: (open: boolean) => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("Administrator");
  const [userInitials, setUserInitials] = useState<string>("AD");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const email = data.user.email || "admin@midigo.example";
        setUserEmail(email);
        const namePart = email.split("@")[0].toUpperCase();
        setUserInitials(namePart.slice(0, 2) || "AD");
        supabase
          .from("profiles")
          .select("role, name, avatar_url")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              if (profile.role) setUserRole(getRoleLabel(profile.role));
              if (profile.name) {
                const parts = profile.name.trim().split(" ");
                setUserInitials(
                  parts.length > 1
                    ? (parts[0][0] + parts[1][0]).toUpperCase()
                    : parts[0].slice(0, 2).toUpperCase(),
                );
              }
              if (profile.avatar_url) {
                const publicUrl = getPublicUrlBrowser(
                  "avatars",
                  profile.avatar_url,
                );
                if (publicUrl) {
                  setAvatarUrl(publicUrl);
                } else {
                  setAvatarUrl(profile.avatar_url);
                }
              }
            }
          });
      }
    });
  }, []);

  const handleSignOut = async () => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest("[data-admin-menu]")
      ) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <div className="admin-brand-row">
          <button
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            className="admin-mobile-menu-button"
            onClick={() => onMobileNavChange(!mobileNavOpen)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          <Link
            aria-label="Admin dashboard"
            className="admin-brand"
            href="/admin"
          >
            Midigo <span>Admin</span>
          </Link>
        </div>

        <div className="admin-header-actions">
          <div className="admin-header-action-group">
            <div className="admin-header-menu" data-admin-menu>
              <button
                aria-expanded={notificationsOpen}
                aria-label="Open notifications"
                className="admin-icon-button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                type="button"
              >
                <IoNotificationsOutline aria-hidden="true" size={20} />
                <span className="admin-notification-dot" />
              </button>
              {notificationsOpen && (
                <div className="admin-menu-popover">
                  <p className="admin-label">System alerts</p>
                  <p>Three live rooms need moderator coverage.</p>
                  <small>2 minutes ago</small>
                </div>
              )}
            </div>
          </div>

          <div className="admin-header-menu" data-admin-menu>
            <button
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
              className="admin-profile-button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              type="button"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Admin avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                userInitials
              )}
            </button>
            {profileOpen && (
              <div className="admin-menu-popover admin-profile-menu">
                <div className="admin-profile-summary">
                  <strong>Admin Account</strong>
                  <span>{userRole}</span>
                  <small>{userEmail || "admin@midigo.example"}</small>
                </div>
                <Link href="/admin/settings">System settings</Link>
                <Link href="/">Return to Midigo</Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="admin-sign-out-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: "0.6rem 0",
                    marginTop: "0.5rem",
                    borderTop: "1px solid var(--border)",
                    color: "var(--danger, #f43f5e)",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <IoLogOutOutline size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
