"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Supabase automatically sets the session when the user clicks the reset link in email
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User arrived via password recovery link
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    } catch (err: unknown) {
      console.error("Update password error:", err);
      setError("Failed to update password. Your reset link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 0" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            marginBottom: "1rem",
            lineHeight: 1.1,
          }}
        >
          Password Updated
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          Your password has been changed successfully. Redirecting you to sign in...
        </p>
        <Link href="/sign-in" className="btn btn-lime">
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 2.75rem)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          marginBottom: "1rem",
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        Set New Password
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          textAlign: "center",
          marginBottom: "2.5rem",
        }}
      >
        Choose a strong password to protect your account.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group" style={{ position: "relative" }}>
          <label htmlFor="password" className="form-label">New Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              style={{ paddingRight: "3rem" }}
              aria-invalid={!!error && !password}
              aria-describedby={error ? "form-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "0.25rem",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-input"
            aria-invalid={!!error && !confirmPassword}
            aria-describedby={error ? "form-error" : undefined}
          />
        </div>

        {error && (
          <div id="form-error" className="form-error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-lime"
          style={{ width: "100%", marginTop: "1rem", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Updating Password..." : "Update Password"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Remember your old password?{" "}
        <Link href="/sign-in" style={{ color: "var(--text-primary)", fontWeight: 500, textDecoration: "none" }}>
          Sign In
        </Link>
      </p>
    </div>
  );
}
