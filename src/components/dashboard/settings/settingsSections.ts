import type { SettingsSection } from "./settingsTypes";

export const SETTINGS_SECTIONS: Array<{
  id: SettingsSection;
  number: string;
  label: string;
}> = [
  { id: "profile", number: "01", label: "Profile" },
  { id: "security", number: "02", label: "Security" },
  { id: "notifications", number: "03", label: "Notifications" },
  { id: "membership", number: "04", label: "Membership" },
  { id: "account", number: "05", label: "Account" },
];
