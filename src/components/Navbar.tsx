"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoChevronDownOutline, IoLogOutOutline, IoPersonCircleOutline } from "react-icons/io5";
import { createClient } from "@/src/lib/supabase/client";

type DropdownItem = {
  label: string;
  description: string;
  href: string;
};

type NavDropdown = {
  label: string;
  groups: {
    heading: string;
    items: DropdownItem[];
  }[];
};

const EXPLORE: NavDropdown = {
  label: "Explore",
  groups: [
    {
      heading: "Content",
      items: [
        { label: "Photo Galleries", description: "Exclusive high-res renders", href: "/dashboard/galleries" },
        { label: "Live Chats", description: "Talk directly with Midigo", href: "/dashboard/live-chats" },
        { label: "Behind the Scenes", description: "The making of the muse", href: "#news" },
      ],
    },
    {
      heading: "Community",
      items: [
        { label: "Fan Forums", description: "Connect with other supporters", href: "#about" },
        { label: "Polls & Voting", description: "Choose the next outfit", href: "#" },
        { label: "VIP Access", description: "Perks for top fans", href: "#join" },
      ],
    },
  ],
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setMobileOpen(false); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <header
      role="banner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "var(--nav-h)",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        background: scrolled ? "var(--navbar-overlay)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div
        className="container"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Wordmark */}
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

        {/* Desktop nav */}
        <nav
          aria-label="Primary navigation"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
          className="nav-desktop"
        >
          {/* Explore dropdown trigger */}
          <div style={{ position: "relative" }}>
            <button
              ref={triggerRef}
              id="nav-explore-btn"
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls="nav-explore-dropdown"
              onClick={() => setOpen(!open)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.5rem 0.875rem",
                color: open ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                fontWeight: 500,
                borderRadius: 4,
              }}
            >
              {EXPLORE.label}
              <IoChevronDownOutline
                size={12}
                style={{
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Dropdown panel */}
            {open && (
              <div
                ref={dropdownRef}
                id="nav-explore-dropdown"
                role="menu"
                aria-label="Explore navigation"
                style={{
                  position: "absolute",
                  top: "calc(100% + 12px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-mid)",
                  borderRadius: 12,
                  padding: "1.5rem",
                  width: 540,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.25rem 2rem",
                  boxShadow: "0 24px 60px var(--shadow-strong)",
                }}
              >
                {EXPLORE.groups.map((group) => (
                  <div key={group.heading}>
                    <p className="label" style={{ marginBottom: "0.875rem" }}>
                      {group.heading}
                    </p>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.125rem", padding: 0, margin: 0 }}>
                      {group.items.map((item) => (
                        <li key={item.label} role="none">
                          <Link
                            href={item.href}
                            role="menuitem"
                            onClick={() => setOpen(false)}
                            style={{
                              display: "block",
                              padding: "0.625rem 0.75rem",
                              borderRadius: 6,
                              textDecoration: "none",
                              border: "1px solid transparent",
                            }}
                            className="nav-dropdown-link"
                          >
                            <span style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>
                              {item.label}
                            </span>
                            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
                              {item.description}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="#about"
            style={{
              padding: "0.5rem 0.875rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              borderRadius: 4,
            }}
            className="nav-link"
          >
            About
          </Link>

          <Link
            href="#news"
            style={{
              padding: "0.5rem 0.875rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              borderRadius: 4,
            }}
            className="nav-link"
          >
            Updates
          </Link>
        </nav>

        {/* Desktop auth actions */}
        <div
          className="nav-desktop"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {user ? (
            <>
              <Link
                href="/dashboard"
                id="nav-dashboard"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  padding: "0.5rem 0.875rem",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
                className="nav-link"
              >
                <IoPersonCircleOutline size={18} />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-mid)",
                  borderRadius: 4,
                  color: "var(--text-secondary)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  padding: "0.45rem 0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <IoLogOutOutline size={15} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                id="nav-sign-in"
                aria-label="Sign in to Midigo"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  padding: "0.5rem 0.875rem",
                  borderRadius: 4,
                }}
                className="nav-link"
              >
                Sign In
              </Link>
              <Link
                href="/join"
                id="nav-join-now"
                className="btn btn-lime"
                style={{ fontSize: "0.8125rem", padding: "0.5rem 1.125rem" }}
              >
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          id="nav-mobile-toggle"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="nav-mobile"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            padding: "0.5rem",
          }}
        >
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "var(--text-primary)",
              borderRadius: 1,
              transform: mobileOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
              transition: "transform 0.2s, opacity 0.2s",
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "var(--text-primary)",
              borderRadius: 1,
              opacity: mobileOpen ? 0 : 1,
              transition: "transform 0.2s, opacity 0.2s",
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "var(--text-primary)",
              borderRadius: 1,
              transform: mobileOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
              transition: "transform 0.2s, opacity 0.2s",
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
          className="nav-mobile"
        >
          {[
            { label: "Galleries", href: "/dashboard/galleries" },
            { label: "Live Chats", href: "/dashboard/live-chats" },
            { label: "Updates", href: "#news" },
            { label: "About", href: "#about" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "0.75rem 0",
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                borderBottom: "1px solid var(--border-lite)",
              }}
            >
              {item.label}
            </Link>
          ))}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn btn-lime"
                  style={{ flex: 1, textAlign: "center" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link
                  href="/join"
                  className="btn btn-lime"
                  style={{ flex: 1 }}
                  onClick={() => setMobileOpen(false)}
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </nav>
      )}

      <style>{`
        @media (min-width: 768px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile  { display: none !important; }
        }
        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex; }
        }
        .nav-link:hover { color: var(--text-primary); background: var(--hover); }
        .nav-dropdown-link:hover {
          background: var(--hover-strong);
          border-color: var(--border);
        }
      `}</style>
    </header>
  );
}
