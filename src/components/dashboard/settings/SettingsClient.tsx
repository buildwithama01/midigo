"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SettingsIntro from "./SettingsIntro";
import SettingsNavigation from "./SettingsNavigation";
import ProfileSettings from "./ProfileSettings";
import SecuritySettings from "./SecuritySettings";
import NotificationsSettings from "./NotificationsSettings";
import MembershipSettings from "./MembershipSettings";
import AccountSettings from "./AccountSettings";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ProfileForm, SettingsSection } from "./settingsTypes";

export default function SettingsClient() {
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      void Promise.resolve().then(() => setLoading(false));
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        supabase
          .from("profiles")
          .select("name, email, avatar_url")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profileData }) => {
            if (profileData) {
              setProfile({
                fullName: profileData.name ?? "",
                email: data.user.email ?? "",
              });
              if (profileData.avatar_url) {
                setAvatarUrl(profileData.avatar_url);
              }
            }
            setLoading(false);
          });
      } else {
        // No authenticated user — redirect to sign-in
        void router.push("/sign-in");
      }
    });
  }, [router]);

  const selectSection = (section: SettingsSection) => {
    setActiveSection(section);
  };

  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };

  if (loading || !profile) {
    return (
      <div className="settings-page">
        <SettingsIntro />
        <div className="settings-layout">
          <SettingsNavigation
            activeSection={activeSection}
            onSelect={selectSection}
          />
          <div className="settings-content">
            <p
              className="admin-table-cell-secondary"
              style={{ marginTop: "1rem" }}
            >
              Loading profile…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <SettingsIntro />

      <div className="settings-layout">
        <SettingsNavigation
          activeSection={activeSection}
          onSelect={selectSection}
        />

        <div className="settings-content">
          {activeSection === "profile" && (
            <ProfileSettings
              profile={profile}
              avatarUrl={avatarUrl}
              onProfileChange={setProfile}
              onAvatarChange={handleAvatarChange}
            />
          )}

          {activeSection === "security" && <SecuritySettings />}

          {activeSection === "notifications" && <NotificationsSettings />}

          {activeSection === "membership" && <MembershipSettings />}

          {activeSection === "account" && <AccountSettings profile={profile} />}
        </div>
      </div>

      {loading && (
        <p className="admin-table-cell-secondary" style={{ marginTop: "1rem" }}>
          Loading profile…
        </p>
      )}
    </div>
  );
}
