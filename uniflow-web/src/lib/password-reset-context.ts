import type { PasswordResetPortal } from "@/lib/role-access";
import { isSuperAdmin, isUniversityPortal } from "@/lib/subdomain";

const PORTAL_VALUES: readonly PasswordResetPortal[] = [
  "mobile",
  "uniflow_admin",
  "university_admin",
];

export function isPasswordResetPortal(
  value: string | null | undefined,
): value is PasswordResetPortal {
  return !!value && (PORTAL_VALUES as readonly string[]).includes(value);
}

/**
 * Infer which forgot-password flow initiated the request.
 * Host takes precedence; explicit body portal is used on the apex domain (mobile app).
 */
export function passwordResetPortalFromRequest(
  host: string,
  bodyPortal?: string | null,
): PasswordResetPortal {
  if (isUniversityPortal(host)) {
    return "university_admin";
  }

  if (isSuperAdmin(host)) {
    return "uniflow_admin";
  }

  if (isPasswordResetPortal(bodyPortal)) {
    return bodyPortal;
  }

  return "uniflow_admin";
}