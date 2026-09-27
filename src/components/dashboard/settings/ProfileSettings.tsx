"use client";

import { FormEvent, useState } from "react";
import AvatarUploader from "@/components/ui/AvatarUploader";
import SettingsFeedback from "./SettingsFeedback";
import type { ProfileForm } from "./settingsTypes";

type ProfileSettingsProps = {
  profile: ProfileForm;
  avatarUrl: string | null;
  onProfileChange: (profile: ProfileForm) => void;
  onAvatarChange?: (url: string) => void;
};

export default function ProfileSettings({
  profile,
  avatarUrl,
  onProfileChange,
  onAvatarChange,
}: ProfileSettingsProps) {
  const [message, setMessage] = useState("");

  const updateProfile = (nextProfile: ProfileForm) => {
    onProfileChange(nextProfile);
    setMessage("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile.fullName.trim() || !profile.email.trim()) {
      setMessage("Enter your full name and email address before saving.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      setMessage("Enter a valid email address.");
      return;
    }

    setMessage("Profile changes saved for this session.");
  };

  return (
    <section
      id="settings-panel-profile"
      role="tabpanel"
      aria-labelledby="settings-tab-profile"
      className="settings-panel"
    >
      <div className="settings-section-heading">
        <p className="label">01 — Identity</p>
        <h2>Profile</h2>
        <p>Keep the details connected to your private Midigo membership up to date.</p>
      </div>

      <div className="settings-profile-layout">
        <AvatarUploader
          currentAvatarUrl={avatarUrl}
          currentName={profile.fullName}
          size={96}
          showLabel={false}
          onUploadSuccess={onAvatarChange}
        />

        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="settings-form-grid">
            <div className="settings-field">
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                className="form-input"
                type="text"
                value={profile.fullName}
                onChange={(event) => updateProfile({ ...profile, fullName: event.target.value })}
                autoComplete="name"
                aria-describedby={message ? "profile-status" : undefined}
              />
            </div>

            <div className="settings-field">
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                className="form-input"
                type="email"
                value={profile.email}
                onChange={(event) => updateProfile({ ...profile, email: event.target.value })}
                autoComplete="email"
                aria-describedby={message ? "profile-status" : undefined}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-lime settings-action">
            Save Changes
          </button>
          <div id="profile-status" aria-live="polite">
            <SettingsFeedback message={message} />
          </div>
        </form>
      </div>
    </section>
  );
}
