export type UserRole =
  | "uniflow_admin"
  | "university_admin"
  | "dean"
  | "hod"
  | "lecturer"
  | "student";

/** Roles that may use the Uniflow mobile app. */
export type MobileAppRole = Extract<
  UserRole,
  "lecturer" | "student" | "dean" | "hod"
>;

/** Roles that sign in through the web admin portals. */
export type WebAdminRole = Extract<
  UserRole,
  "uniflow_admin" | "university_admin"
>;

export const MOBILE_APP_ROLES: readonly MobileAppRole[] = [
  "lecturer",
  "student",
  "dean",
  "hod",
];

export const WEB_ADMIN_ROLES: readonly WebAdminRole[] = [
  "uniflow_admin",
  "university_admin",
];

export type PasswordResetPortal = "mobile" | "uniflow_admin" | "university_admin";

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

/** True when the account may use the matching web admin portal. */
export function hasWebAdminAccess(
  role: string | null | undefined,
  portal: WebAdminRole,
): boolean {
  return role === portal;
}

/**
 * Whether a password reset may be requested from a given portal.
 * - mobile: student / lecturer / dean / HOD only
 * - uniflow_admin: uniflow admins on uniflowapp.xyz only
 * - university_admin: self-service disabled; resets are issued by Uniflow admin only
 */
export function canRequestPasswordReset(
  role: string | null | undefined,
  portal: PasswordResetPortal,
): boolean {
  switch (portal) {
    case "mobile":
      return hasMobileAppAccess(role);
    case "uniflow_admin":
      return role === "uniflow_admin";
    case "university_admin":
      return false;
    default:
      return false;
  }
}

export function getMobileAppAccessDeniedMessage(): string {
  return "This app is for lecturers, students, deans, and HODs only. Admin accounts must use the web portal.";
}

export function getPasswordResetDeniedMessage(
  portal: PasswordResetPortal,
): string {
  switch (portal) {
    case "mobile":
      return "This reset option is for student and lecturer accounts. Admin accounts must use the web portal.";
    case "uniflow_admin":
      return "This page is for Uniflow admin accounts only.";
    case "university_admin":
      return "University admin password resets must be requested through your Uniflow administrator.";
    default:
      return "Password reset is not available for this account here.";
  }
}