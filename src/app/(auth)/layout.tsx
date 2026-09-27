import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--background)",
      }}
    >
      {/* Minimal Header */}
      <header
        style={{
          padding: "1.5rem",
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/"
          aria-label="Midigo home"
          style={{
            fontSize: "1.3125rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          Midigo
        </Link>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1.5rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {children}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer
        style={{
          padding: "2rem",
          textAlign: "center",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} Midigo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
