"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please fill in your email address.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
          Check Your Email
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
          We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the link to set a new password.
        </p>
        <Link href="/sign-in" className="btn btn-lime">
          Return to Sign In
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
        Reset Password
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          textAlign: "center",
          marginBottom: "2.5rem",
        }}
      >
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            aria-invalid={!!error && (!email || !email.includes("@"))}
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
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Remember your password?{" "}
        <Link href="/sign-in" style={{ color: "var(--text-primary)", fontWeight: 500, textDecoration: "none" }}>
          Sign In
        </Link>
      </p>
    </div>
  );
}
