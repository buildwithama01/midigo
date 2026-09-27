"use client";

import { useState } from "react";
import NotificationRow from "./NotificationRow";
import type { NotificationPreferences } from "./settingsTypes";

const NOTIFICATIONS = [
  {
    id: "messages",
    title: "New messages",
    description: "When Midigo or another member replies to you.",
  },
  {
    id: "liveAlerts",
    title: "Live chat / Q&A alerts",
    description: "A quiet reminder before scheduled live rooms begin.",
  },
  {
    id: "newContent",
    title: "New content",
    description: "When a new editorial gallery or behind-the-scenes release arrives.",
  },
  {
    id: "accountUpdates",
    title: "Membership / account updates",
    description: "Renewal notices, plan changes, and important account information.",
  },
] as const;

const initialPreferences: NotificationPreferences = {
  messages: true,
  liveAlerts: true,
  newContent: true,
  accountUpdates: false,
};

export default function NotificationsSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences);

  const updatePreference = (key: keyof NotificationPreferences, checked: boolean) => {
    setPreferences((current) => ({ ...current, [key]: checked }));
  };

  return (
    <section
      id="settings-panel-notifications"
      role="tabpanel"
      aria-labelledby="settings-tab-notifications"
      className="settings-panel"
    >
      <div className="settings-section-heading">
        <p className="label">03 — Updates</p>
        <h2>Notifications</h2>
        <p>Choose which Midigo moments should reach your inbox.</p>
      </div>

      <div className="settings-notification-list">
        {NOTIFICATIONS.map((notification) => (
          <NotificationRow
            key={notification.id}
            id={`notification-${notification.id}`}
            title={notification.title}
            description={notification.description}
            checked={preferences[notification.id]}
            onChange={(checked) => updatePreference(notification.id, checked)}
          />
        ))}
      </div>

      <p className="settings-notification-status" role="status" aria-live="polite">
        Preferences are simulated and remain local to this session.
      </p>
    </section>
  );
}
