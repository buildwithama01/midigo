import type { Database } from "./database.types";

export type ProfileRole =
  NonNullable<NonNullable<Database["public"]["Tables"]["profiles"]["Row"]>["role"]>;

/**
 * Role hierarchy — higher number = higher privilege.
 * fan → chatter → moderator → editor → administrator
 */
export const ROLE_HIERARCHY: Record<ProfileRole, number> = {
  fan: 0,
  chatter: 1,
  moderator: 2,
  editor: 3,
  administrator: 4,
};

export type Role = keyof typeof ROLE_HIERARCHY;

/**
 * Human-readable label for each role.
 */
export const ROLE_LABELS: Record<ProfileRole, string> = {
  fan: "Fan",
  chatter: "Chatter",
  moderator: "Moderator",
  editor: "Editor",
  administrator: "Admin",
};

/**
 * Get the numeric level of a role.
 * Returns -1 if the role is unrecognized.
 */
export function getRoleLevel(role: string | null | undefined): number {
  if (!role || !(role in ROLE_HIERARCHY)) return -1;
  return ROLE_HIERARCHY[role as ProfileRole];
}

/**
 * Returns the human-readable label for a role, or "Unknown" if unrecognized.
 */
export function getRoleLabel(role: string | null | undefined): string {
  if (!role || !(role in ROLE_LABELS)) return "Unknown";
  return ROLE_LABELS[role as ProfileRole];
}

/**
 * Check whether `userRole` satisfies or exceeds `requiredRole`.
 *
 * @example
 * hasRole("administrator", "moderator") // true
 * hasRole("editor", "administrator")    // false
 */
export function hasRole(
  userRole: string | null | undefined,
  requiredRole: Role,
): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}
