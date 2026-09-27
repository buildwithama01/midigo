"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { useChatterWorkspace } from "./ChatterWorkspaceContext";

export default function ChatterHeader({
  mobileNavOpen,
  onMobileNavChange,
}: {
  mobileNavOpen: boolean;
  onMobileNavChange: (open: boolean) => void;
}) {
  const { online, setOnline } = useChatterWorkspace();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      if (event.target instanceof Element && !event.target.closest("[data-header-menu]")) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  const closeProfile = () => {
    setProfileOpen(false);
    setNotificationsOpen(false);
  };

  return (
    <header className="chatter-header">
      <div className="chatter-header-inner">
        <div className="chatter-brand-row">
          <button
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            className="chatter-mobile-menu-button"
            onClick={() => onMobileNavChange(!mobileNavOpen)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          <Link aria-label="Chatter overview" className="chatter-brand" href="/chatter">
            Midigo <span>Chatter</span>
          </Link>
        </div>

        <div className="chatter-header-actions">
          <button
            aria-pressed={online}
            className="chatter-presence-toggle"
            onClick={() => setOnline(!online)}
            type="button"
          >
            <span className="chatter-presence-dot" />
            <span className="chatter-presence-copy">
              <strong>{online ? "Online" : "Offline"}</strong>
              <small>{online ? "Visible to fans" : "Hidden from fans"}</small>
            </span>
          </button>

          <div className="chatter-header-menu" data-header-menu>
            <button
              aria-expanded={notificationsOpen}
              aria-label="Open notifications"
              className="chatter-icon-button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              type="button"
            >
              <IoNotificationsOutline aria-hidden="true" size={20} />
              <span className="chatter-unread-dot" />
            </button>
            {notificationsOpen && (
              <div className="chatter-menu-popover chatter-notifications-popover">
                <p className="label">New in your queue</p>
                <p>Nia needs help locating the Tokyo collection.</p>
                <small>2 minutes ago</small>
              </div>
            )}
          </div>

          <div className="chatter-header-menu" data-header-menu>
            <button
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
              className="chatter-profile-button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              type="button"
            >
              AL
            </button>
            {profileOpen && (
              <div className="chatter-menu-popover chatter-profile-popover">
                <div className="chatter-profile-summary">
                  <strong>Avery Lane</strong>
                  <span>Chatter</span>
                  <small>avery.lane@midigo.example</small>
                </div>
                <Link href="/dashboard/settings" onClick={closeProfile}>
                  Workspace settings
                </Link>
                <Link href="/" onClick={closeProfile}>
                  Return to Midigo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
