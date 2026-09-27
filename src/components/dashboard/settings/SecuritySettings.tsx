"use client";

import { FormEvent, useState } from "react";
import PasswordField from "./PasswordField";
import SettingsFeedback from "./SettingsFeedback";
import type { PasswordForm } from "./settingsTypes";

const initialPassword: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SecuritySettings() {
  const [password, setPassword] = useState<PasswordForm>(initialPassword);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
      setMessage("Complete all password fields before continuing.");
      return;
    }

    if (password.newPassword.length < 8) {
      setMessage("Your new password must contain at least 8 characters.");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      setMessage("Your new password and confirmation do not match.");
      return;
    }

    setPassword(initialPassword);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setMessage("Password change simulated successfully.");
  };

  return (
    <section
      id="settings-panel-security"
      role="tabpanel"
      aria-labelledby="settings-tab-security"
      className="settings-panel"
    >
      <div className="settings-section-heading">
        <p className="label">02 — Privacy</p>
        <h2>Security</h2>
        <p>Review your credentials and choose a new password for your fan account.</p>
      </div>

      <form className="settings-form settings-form-narrow" onSubmit={handleSubmit}>
        <PasswordField
          id="current-password"
          label="Current Password"
          value={password.currentPassword}
          onChange={(value) => setPassword({ ...password, currentPassword: value })}
          show={showCurrentPassword}
          onToggleShow={() => setShowCurrentPassword((current) => !current)}
          autoComplete="current-password"
          statusId={message ? "security-status" : undefined}
        />

        <PasswordField
          id="new-password"
          label="New Password"
          value={password.newPassword}
          onChange={(value) => setPassword({ ...password, newPassword: value })}
          show={showNewPassword}
          onToggleShow={() => setShowNewPassword((current) => !current)}
          autoComplete="new-password"
          statusId={message ? "security-status" : undefined}
        />

        <PasswordField
          id="confirm-password"
          label="Confirm Password"
          value={password.confirmPassword}
          onChange={(value) => setPassword({ ...password, confirmPassword: value })}
          show={showConfirmPassword}
          onToggleShow={() => setShowConfirmPassword((current) => !current)}
          autoComplete="new-password"
          statusId={message ? "security-status" : undefined}
        />

        <button type="submit" className="btn btn-lime settings-action">
          Change Password
        </button>
        <div id="security-status" aria-live="polite">
          <SettingsFeedback message={message} />
        </div>
      </form>
    </section>
  );
}
