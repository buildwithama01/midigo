"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// 30 minutes in milliseconds
const TIMEOUT_MS = 30 * 60 * 1000;

export default function SessionTimeoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }, [router, supabase]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

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
  }, [handleLogout]);

  return <>{children}</>;
}
