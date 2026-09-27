export type SettingsSection = "profile" | "security" | "notifications" | "membership" | "account";

export type ProfileForm = {
  fullName: string;
  email: string;
};

export type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type NotificationPreferences = {
  messages: boolean;
  liveAlerts: boolean;
  newContent: boolean;
  accountUpdates: boolean;
};

export type AccountState = "idle" | "confirm" | "complete";
