"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IoShieldCheckmarkOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoArrowForwardOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import { createClient } from "@/src/lib/supabase/client";
import {
  isSupabaseConfigured,
  SUPABASE_SETUP_MESSAGE,
} from "@/src/lib/supabase/config";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectedFrom = searchParams.get("redirectedFrom") || "/admin";
  const urlError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }
    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!isSupabaseConfigured()) {
      setErrorMsg(SUPABASE_SETUP_MESSAGE);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();

      // 1. Sign in via Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        // Provide clear feedback
        if (authError.message.includes("Invalid login credentials")) {
          setErrorMsg(
            "Invalid email or password. Verify the admin account created in Supabase.",
          );
        } else {
          setErrorMsg(authError.message);
        }
        setLoading(false);
        return;
      }

      if (authData.user) {
        // 2. Verify admin/moderator role in profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", authData.user.id)
          .single();

        if (profileError) {
          // If profile table doesn't have the row yet or RLS restriction
          console.warn("Could not fetch user profile role:", profileError);
        }

        const allowedRoles = ["administrator", "moderator", "editor"];
        if (profile && !allowedRoles.includes(profile.role)) {
          await supabase.auth.signOut();
          setErrorMsg(
            `Access Denied: Your account role is "${profile.role}". Only administrators, editors, and moderators have access to this portal.`,
          );
          setLoading(false);
          return;
        }

        if (profile && profile.status === "suspended") {
          await supabase.auth.signOut();
          setErrorMsg(
            "This account has been suspended. Please contact platform security.",
          );
          setLoading(false);
          return;
        }

        // Successfully authorized
        router.push(redirectedFrom);
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Login unexpected error:", err);
      // Fallback for offline/demo environment if Supabase isn't reachable
      setErrorMsg(
        "Connection error. Ensure your Supabase credentials are configured in .env.local.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Top badge */}
        <div className="admin-login-badge">
          <IoShieldCheckmarkOutline size={14} />
          <span>Internal Control Plane</span>
        </div>

        <h1 className="admin-login-title">Admin Console</h1>
        <p className="admin-login-desc">
          Sign in with your database-provisioned administrator or staff
          credentials.
        </p>

        {urlError === "unauthorized" && !errorMsg && (
          <div
            className="admin-login-alert admin-login-alert-error"
            role="alert"
          >
            <IoAlertCircleOutline size={18} style={{ flexShrink: 0 }} />
            <span>
              You do not have administrative privileges to view that page.
            </span>
          </div>
        )}

        {redirectedFrom !== "/admin" && !urlError && !errorMsg && (
          <div className="admin-login-alert admin-login-alert-info">
            <IoInformationCircleOutline size={18} style={{ flexShrink: 0 }} />
            <span>
              Please authenticate to access the requested admin route.
            </span>
          </div>
        )}

        {errorMsg && (
          <div
            className="admin-login-alert admin-login-alert-error"
            role="alert"
          >
            <IoAlertCircleOutline size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <div className="admin-login-field">
            <label htmlFor="admin-email" className="admin-login-label">
              Admin Email
            </label>
            <div className="admin-login-input-wrap">
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@midigo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-login-input"
              />
            </div>
          </div>

          <div className="admin-login-field">
            <div className="admin-login-label">
              <label htmlFor="admin-password">Password</label>
              <Link
                href="/forgot-password"
                style={{
                  color: "var(--purple)",
                  fontSize: "0.75rem",
                  textDecoration: "none",
                }}
              >
                Reset key?
              </Link>
            </div>
            <div className="admin-login-input-wrap">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-login-input"
                style={{ paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                className="admin-login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <IoEyeOffOutline size={18} />
                ) : (
                  <IoEyeOutline size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-login-submit"
            id="admin-submit-btn"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <IoLockClosedOutline size={16} />
                <span>Enter Admin Console</span>
                <IoArrowForwardOutline size={16} />
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer-info">
          Protected by Supabase Auth & Row Level Security (RLS).
          <br />
          <Link href="/">← Return to Midigo Platform</Link>
        </div>
      </div>
    </div>
  );
}
