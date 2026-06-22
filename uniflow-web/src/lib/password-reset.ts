import {
  APP_URL,
  resolveProtocolFromRequestHost,
  superAdminUrl,
  universityPortalUrl,
} from "@/lib/domain";
import { getSubdomain, isUniversityPortal } from "@/lib/subdomain";

/**
 * Land directly on the reset page so mobile browsers establish the recovery
 * session client-side (in-app mail browsers often drop server-set auth cookies).
 */
export function defaultPasswordResetUrl(): string {
  return `${APP_URL}/reset-password`;
}

/**
 * Password reset landing for university admins.
 * Uses the apex domain with a university query param so Supabase redirect
 * allowlists (which often only include the main site URL) still route correctly.
 */
export function universityAdminPasswordResetUrl(shortName: string): string {
  const url = new URL(`${APP_URL}/reset-password`);
  url.searchParams.set("university", shortName);
  return url.toString();
}

/** Reset URL that matches the portal the user is on (university subdomain vs apex). */
export function passwordResetUrlFromRequestHost(host: string): string {
  const protocol = resolveProtocolFromRequestHost(host);
  const origin = `${protocol}://${host}`;

  if (isUniversityPortal(host)) {
    return `${origin}/reset-password`;
  }

  if (getSubdomain(host) === "super") {
    return `${origin}/reset-password`;
  }

  return defaultPasswordResetUrl();
}

export function passwordResetUrlFromRequest(request: Request): string {
  const host = request.headers.get("host") || "";
  return passwordResetUrlFromRequestHost(host);
}

/** Pick the correct reset redirect for a profile (role + university). */
export function passwordResetUrlForProfile(
  role: string | null | undefined,
  universityShortName: string | null | undefined,
  requestHost: string,
): string {
  if (role === "university_admin" && universityShortName) {
    return universityAdminPasswordResetUrl(universityShortName);
  }

  if (role === "uniflow_admin") {
    if (getSubdomain(requestHost) === "super") {
      const protocol = resolveProtocolFromRequestHost(requestHost);
      return `${protocol}://${requestHost}/reset-password`;
    }
    return superAdminUrl("/reset-password");
  }

  return passwordResetUrlFromRequestHost(requestHost);
}