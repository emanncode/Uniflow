import {
  APP_URL,
  resolveBaseDomainFromRequestHost,
  resolveProtocolFromRequestHost,
  universityPortalUrl,
} from "@/lib/domain";
import { getSubdomain } from "@/lib/subdomain";

/**
 * Land directly on the reset page so mobile browsers establish the recovery
 * session client-side (in-app mail browsers often drop server-set auth cookies).
 */
export function defaultPasswordResetUrl(): string {
  return `${APP_URL}/reset-password`;
}

/** Password reset landing page for a university admin portal. */
export function universityAdminPasswordResetUrl(shortName: string): string {
  return universityPortalUrl(shortName, "/reset-password");
}

/** Reset URL that matches the portal the user is on (university subdomain vs apex). */
export function passwordResetUrlFromRequestHost(host: string): string {
  const protocol = resolveProtocolFromRequestHost(host);
  const subdomain = getSubdomain(host);
  const origin = `${protocol}://${host}`;

  if (subdomain?.endsWith("-admin")) {
    return `${origin}/reset-password`;
  }

  if (subdomain === "super") {
    return `${origin}/reset-password`;
  }

  return defaultPasswordResetUrl();
}

export function passwordResetUrlFromRequest(request: Request): string {
  const host = request.headers.get("host") || "";
  return passwordResetUrlFromRequestHost(host);
}