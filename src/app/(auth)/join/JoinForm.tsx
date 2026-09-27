"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export default function JoinForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim(),
          },
          emailRedirectTo: `${origin}/dashboard`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If Supabase has email confirmation enabled and no session is returned immediately
      if (data.user && !data.session) {
        setEmailConfirmationRequired(true);
        setSubmitted(true);
      } else if (data.session) {
        // Automatically signed in
        router.push("/dashboard");
        router.refresh();
      } else {
        setSubmitted(true);
      }
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred. Please check your network and try again.");
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
          {emailConfirmationRequired ? "Check Your Inbox" : "Welcome to Midigo"}
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
          {emailConfirmationRequired
            ? `We sent a confirmation link to ${email}. Please click the link in your email to activate your account and complete registration.`
            : "Your account has been created successfully. Welcome to the creator frontier."}
        </p>
        <Link href="/sign-in" className="btn btn-lime">
          Proceed to Sign In
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
        Join Midigo
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          textAlign: "center",
          marginBottom: "2.5rem",
        }}
      >
        Create an account to join live rooms and the creator community.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            aria-invalid={!!error && !name}
            aria-describedby={error ? "form-error" : undefined}
          />
        </div>

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

        <div className="form-group" style={{ position: "relative" }}>
          <label htmlFor="password" className="form-label">Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
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
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link href="/sign-in" style={{ color: "var(--text-primary)", fontWeight: 500, textDecoration: "none" }}>
          Sign In
        </Link>
      </p>
    </div>
  );
}
