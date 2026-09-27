import type { Role } from "./supabase/roles";

/**
 * Maps admin route paths to the minimum role required to access them.
 *
 * Any route not listed here defaults to "editor" (the minimum for admin access).
 */
export const ADMIN_ROUTE_PERMISSIONS: Record<string, Role> = {
  "/admin": "editor",
  "/admin/moderation": "moderator",
  "/admin/audit-logs": "moderator",
  "/admin/roles-permissions": "administrator",
  "/admin/settings": "administrator",
};

/**
 * Get the minimum required role for a given pathname.
 * Returns "editor" as the default for unlisted admin routes.
 * Returns null if the pathname is not an admin route.
 */
export function getRequiredRoleForRoute(pathname: string): Role | null {
  // Strip trailing slash and query string; ensure /admin prefix
  const cleanPath = pathname.replace(/\/$/, "").split("?")[0];

  if (!cleanPath.startsWith("/admin")) return null;

  // Try exact match first
  if (cleanPath in ADMIN_ROUTE_PERMISSIONS) {
    return ADMIN_ROUTE_PERMISSIONS[cleanPath];
  }

  // Try progressively shorter paths (e.g., /admin/users/123 → /admin/users → /admin/users)
  const segments = cleanPath.split("/").filter(Boolean);
  while (segments.length > 1) {
    segments.pop();
    const candidate = `/${segments.join("/")}`;
    if (candidate in ADMIN_ROUTE_PERMISSIONS) {
      return ADMIN_ROUTE_PERMISSIONS[candidate];
    }
  }

  // Default: admin routes require at least "editor"
  return "editor";
}
