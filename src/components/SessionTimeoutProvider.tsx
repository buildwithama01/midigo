"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// 30 minutes in milliseconds
const TIMEOUT_MS = 30 * 60 * 1000;

export default function SessionTimeoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) return;
      router.push("/sign-in");
      router.refresh();
    };

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
      }, TIMEOUT_MS);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimeout);
    });

    // Initialize timer
    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [router]);

  return <>{children}</>;
}
