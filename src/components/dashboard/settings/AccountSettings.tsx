"use client";

import { useState } from "react";
import Link from "next/link";
import type { AccountState, ProfileForm } from "./settingsTypes";

type AccountSettingsProps = {
  profile: ProfileForm;
};

export default function AccountSettings({ profile }: AccountSettingsProps) {
  const [accountState, setAccountState] = useState<AccountState>("idle");

  return (
    <section
      id="settings-panel-account"
      role="tabpanel"
      aria-labelledby="settings-tab-account"
      className="settings-panel"
    >
      <div className="settings-section-heading">
        <p className="label">05 — Account</p>
        <h2>Account</h2>
        <p>Review your membership status and manage access to this fan account.</p>
      </div>

      {accountState === "idle" && (
        <>
          <dl className="settings-account-details">
            <div>
              <dt>Account holder</dt>
              <dd>{profile.fullName || "Avery Lane"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile.email || "avery.lane@example.com"}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>September 2026</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd className="settings-active-status">Active</dd>
            </div>
          </dl>

          <div className="settings-account-actions">
            <Link href="/" className="btn btn-ghost">
              Sign Out
            </Link>
            <button
              type="button"
              className="settings-text-button"
              onClick={() => setAccountState("confirm")}
            >
              Deactivate / Delete Account
            </button>
          </div>
        </>
      )}

      {accountState === "confirm" && (
        <div className="settings-confirmation">
          <p className="label label-purple">Private account action</p>
          <h3>Deactivate this account?</h3>
          <p>
            This demonstration does not connect to an account service. Confirming will only simulate the action within this page.
          </p>
          <div className="settings-confirmation-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAccountState("idle")}
            >
              Keep Account
            </button>
            <button
              type="button"
              className="btn btn-lime"
              onClick={() => setAccountState("complete")}
            >
              Confirm Deactivation
            </button>
          </div>
        </div>
      )}

      {accountState === "complete" && (
        <div className="settings-confirmation" role="status" aria-live="polite">
          <p className="label label-purple">Simulation complete</p>
          <h3>Account deactivation simulated.</h3>
          <p>No account data was changed. Return to the account section to reset this state.</p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setAccountState("idle")}
          >
            Back to Account
          </button>
        </div>
      )}
    </section>
  );
}
