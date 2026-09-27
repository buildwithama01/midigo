import type { Metadata } from "next";
import SettingsClient from "@/src/components/dashboard/settings/SettingsClient";

export const metadata: Metadata = {
  title: "Settings | Midigo",
  description: "Manage your Midigo fan profile, security, notifications, membership, and account settings.",
};

export default function SettingsPage() {
  return (
    <div className="container">
      <SettingsClient />
    </div>
  );
}
