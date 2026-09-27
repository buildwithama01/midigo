"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import {
  isSupabaseConfigured,
  SUPABASE_SETUP_MESSAGE,
} from "@/src/lib/supabase/config";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(() =>
    isSupabaseConfigured() ? "" : SUPABASE_SETUP_MESSAGE,
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setError(SUPABASE_SETUP_MESSAGE);
      return;
    }

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
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
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError(
            "Invalid email or password. Please verify your credentials.",
          );
        } else if (signInError.message.includes("Email not confirmed")) {
          setError(
            "Please verify your email address before signing in. Check your inbox for the confirmation link.",
          );
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch role to route users appropriately
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "administrator") {
          router.push("/admin");
        } else if (profile?.role === "chatter") {
          router.push("/chatter");
        } else {
          const redirectedFrom = new URLSearchParams(
            window.location.search,
          ).get("redirectedFrom");
          const returnPath =
            redirectedFrom?.startsWith("/") && !redirectedFrom.startsWith("//")
              ? redirectedFrom
              : "/dashboard";
          router.push(returnPath);
        }
        router.refresh();
        return;
      }

      setError(
        "Sign-in did not return an authenticated user. Please try again.",
      );
      setLoading(false);
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      setError("An unexpected connection error occurred. Please try again.");
      setLoading(false);
    }
  };

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
        Sign In
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          textAlign: "center",
          marginBottom: "2.5rem",
        }}
      >
        Welcome back to the frontier.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{
                fontSize: "0.8125rem",
                color: "var(--purple)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Forgot password?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
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
          <div
            id="form-error"
            className="form-error"
            style={{ marginBottom: "1.5rem" }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isSupabaseConfigured()}
          className="btn btn-lime"
          style={{
            width: "100%",
            marginTop: "1rem",
            opacity: loading || !isSupabaseConfigured() ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p
        style={{
          textAlign: "center",
          marginTop: "2rem",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/join"
          style={{
            color: "var(--text-primary)",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Join Now
        </Link>
      </p>
    </div>
  );
}
