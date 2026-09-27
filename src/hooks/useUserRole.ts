import { useEffect, useState } from "react";
import type { Database } from "@/lib/supabase/database.types";
import { getUserRoleAction } from "@/app/admin/actions/getUserRole";

export type UserRole =
  NonNullable<NonNullable<Database["public"]["Tables"]["profiles"]["Row"]>["role"]>;
export type UserStatus =
  NonNullable<NonNullable<Database["public"]["Tables"]["profiles"]["Row"]>["status"]>;

interface UserRoleState {
  role: UserRole | null;
  status: UserStatus | null;
  loading: boolean;
}

/**
 * Client-side hook that fetches the current user's role and status
 * from the profiles table via a Server Action.
 *
 * Must be called within a React client component tree.
 */
export function useUserRole(): UserRoleState {
  const [role, setRole] = useState<UserRole | null>(null);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getUserRoleAction().then((result) => {
      if (cancelled) return;
      if (result) {
        setRole(result.role as UserRole);
        setStatus(result.status as UserStatus);
      } else {
        setRole(null);
        setStatus(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { role, status, loading };
}
