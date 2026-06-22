import type { MobileRole, UserRole } from "@/types";

/** Roles that may use the Uniflow mobile app. */
export type MobileAppRole = MobileRole;

export const MOBILE_APP_ROLES: readonly MobileAppRole[] = [
  "lecturer",
  "student",
  "dean",
  "hod",
];

export const WEB_ADMIN_ROLES = ["uniflow_admin", "university_admin"] as const;
export type WebAdminRole = (typeof WEB_ADMIN_ROLES)[number];

export function isMobileAppRole(
  role: string | null | undefined,
): role is MobileAppRole {
  return (
    !!role && (MOBILE_APP_ROLES as readonly string[]).includes(role)
  );
}

export function isWebAdminRole(
  role: string | null | undefined,
): role is WebAdminRole {
  return !!role && (WEB_ADMIN_ROLES as readonly string[]).includes(role);
}

/** True when the account may use the mobile app (student, lecturer, dean, or HOD). */
export function hasMobileAppAccess(role: string | null | undefined): boolean {
  return isMobileAppRole(role);
}

/** True when the account is a web-only admin (must not use the mobile app). */
export function isWebOnlyAdmin(role: string | null | undefined): boolean {
  return isWebAdminRole(role);
}

export function assertMobileAppAccess(role: UserRole): boolean {
  return hasMobileAppAccess(role);
}

export function getMobileAppAccessDeniedMessage(): string {
  return "This app is for lecturers, students, deans, and HODs only. Admin accounts must use the web portal.";
}