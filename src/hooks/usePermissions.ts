import { useUserRole } from "./useUserRole";
import { getRoleLevel, ROLE_HIERARCHY } from "@/lib/supabase/roles";
import type { Role } from "@/lib/supabase/roles";

export interface Permissions {
  role: string | null;
  loading: boolean;
  can: (requiredRole: Role) => boolean;
  canModerate: boolean;
  canEditContent: boolean;
  isAdmin: boolean;
}

/**
 * Client-side hook that provides role-based permission checks.
 *
 * Must be called within a React client component tree (uses useUserRole).
 *
 * @example
 * const { canModerate, isAdmin } = usePermissions();
 * if (canModerate) { ... }
 * if (usePermissions().can("administrator")) { ... }
 */
export function usePermissions(): Permissions {
  const { role, status, loading } = useUserRole();

  const can = (requiredRole: Role): boolean => {
    if (loading || !role) return false;
    return getRoleLevel(role) >= getRoleLevel(requiredRole);
  };

  return {
    role,
    loading,
    can,
    canModerate: can("moderator"),
    canEditContent: can("editor"),
    isAdmin: can("administrator"),
  };
}

export { ROLE_HIERARCHY };
