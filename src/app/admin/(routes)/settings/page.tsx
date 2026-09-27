"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminButton from "@/src/components/admin/AdminButton";
import AdminModal from "@/src/components/admin/AdminModal";
import AdminPageHeader from "@/src/components/admin/AdminPageHeader";
import AdminSection from "@/src/components/admin/AdminSection";
import AdminToggle from "@/src/components/admin/AdminToggle";
import { useState } from "react";
import { useAdminWorkspace } from "@/src/components/admin/AdminWorkspaceContext";
import {
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoServerOutline,
  IoDocumentTextOutline,
  IoKeyOutline
} from "react-icons/io5";

const settingGroups = [
  {
    title: "Workspace",
    description: "Core platform preferences",
    rows: [
      ["Admin notifications", "Receive alerts for moderation and room coverage.", true],
      ["Weekly performance digest", "Send a summary of platform activity every Monday.", true],
      ["Public maintenance notices", "Show scheduled maintenance updates to members.", false],
    ] as const,
  },
  {
    title: "Safety",
    description: "Protection and review controls",
    rows: [
      ["Automatic report triage", "Route new reports to the appropriate queue.", true],
      ["Live-room coverage alerts", "Notify moderators when a room needs support.", true],
      ["Require action notes", "Ask moderators to document high-severity decisions.", true],
    ] as const,
  },
  {
    title: "Integrations",
    description: "Connected services",
    rows: [
      ["Analytics export", "Make report data available to connected tools.", false],
      ["Audit log forwarding", "Send system events to an external log destination.", false],
      ["Developer webhooks", "Allow approved events to trigger external workflows.", false],
    ] as const,
  },
];

const defaultSettings = Object.fromEntries(
  settingGroups.flatMap((group) =>
    group.rows.map(([label, , checked]) => [label, checked]),
  ),
);

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [savedSettings, setSavedSettings] = useState(defaultSettings);
  const [resetOpen, setResetOpen] = useState(false);
  const { notify } = useAdminWorkspace();
  const dirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const updateSetting = (label: string, checked: boolean) => {
    setSettings((current) => ({ ...current, [label]: checked }));
  };

  const saveSettings = () => {
    setSavedSettings(settings);
    notify("Settings saved for this workspace.");
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setSavedSettings(defaultSettings);
    setResetOpen(false);
    notify("Default workspace settings restored.");
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="System settings"
        title="Configure Midigo."
        description="Control workspace preferences, safety behavior, and connected services from one place."
        actions={
          <>
            <AdminButton onClick={() => setResetOpen(true)} variant="secondary">
              Reset settings
            </AdminButton>
            <AdminButton disabled={!dirty} onClick={saveSettings} variant="primary">
              Save changes
            </AdminButton>
          </>
        }
      />

      <div className="admin-settings-grid">
        {settingGroups.map((group) => (
          <AdminSection key={group.title} title={group.title} description={group.description}>
            <div className="admin-settings-panel">
              {group.rows.map(([label, description]) => (
                <div className="admin-settings-row" key={label}>
                  <div><strong>{label}</strong><p>{description}</p></div>
                  <AdminToggle
                    checked={settings[label]}
                    label={label}
                    onChange={(checked) => updateSetting(label, checked)}
                  />
                </div>
              ))}
            </div>
          </AdminSection>
        ))}
      </div>

      <div className="admin-module-grid">
        <AdminSection title="Workspace status" description="System health" action={<AdminBadge tone="success">Healthy</AdminBadge>}>
          <div className="admin-list">
            <div className="admin-list-item"><span className="admin-list-icon admin-list-icon-success" aria-hidden="true"><IoCheckmarkCircleOutline /></span><div className="admin-list-copy"><strong>API</strong><p>Responding within normal limits</p></div><AdminBadge tone="success">Operational</AdminBadge></div>
            <div className="admin-list-item"><span className="admin-list-icon admin-list-icon-success" aria-hidden="true"><IoCheckmarkCircleOutline /></span><div className="admin-list-copy"><strong>Media</strong><p>All published assets available</p></div><AdminBadge tone="success">Operational</AdminBadge></div>
            <div className="admin-list-item"><span className="admin-list-icon admin-list-icon-warning" aria-hidden="true"><IoWarningOutline /></span><div className="admin-list-copy"><strong>Exports</strong><p>Queue is processing normally</p></div><AdminBadge tone="warning">Monitoring</AdminBadge></div>
          </div>
        </AdminSection>
        <AdminSection title="Environment" description="Current workspace" action={<AdminBadge tone="info">Prototype</AdminBadge>}>
          <div className="admin-list">
            <div className="admin-list-item"><span className="admin-list-icon" aria-hidden="true"><IoServerOutline /></span><div className="admin-list-copy"><strong>Environment</strong><p>Local development workspace</p></div><AdminBadge>Local</AdminBadge></div>
            <div className="admin-list-item"><span className="admin-list-icon" aria-hidden="true"><IoDocumentTextOutline /></span><div className="admin-list-copy"><strong>Data source</strong><p>Typed local seed records</p></div><AdminBadge>Seed data</AdminBadge></div>
            <div className="admin-list-item"><span className="admin-list-icon" aria-hidden="true"><IoKeyOutline /></span><div className="admin-list-copy"><strong>Access</strong><p>Administrator role</p></div><AdminBadge tone="accent">Full access</AdminBadge></div>
          </div>
        </AdminSection>
      </div>

      <AdminModal
        confirmLabel="Reset settings"
        danger
        onClose={() => setResetOpen(false)}
        onConfirm={resetSettings}
        open={resetOpen}
        title="Reset workspace preferences"
      >
        <p>Resetting restores every default Admin setting. Existing records and audit history are not affected.</p>
      </AdminModal>
    </>
  );
}
