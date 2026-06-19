import { APP_URL, resolveBaseDomainFromRequestHost, resolveProtocolFromRequestHost } from "@/lib/domain";
import { getSubdomain } from "@/lib/subdomain";

/** Canonical reset page for mobile users and apex-domain auth emails. */
export function defaultPasswordResetUrl(): string {
  return `${APP_URL}/reset-password`;
}

/** Reset URL that matches the portal the user is on (university subdomain vs apex). */
export function passwordResetUrlFromRequestHost(host: string): string {
  const protocol = resolveProtocolFromRequestHost(host);
  const subdomain = getSubdomain(host);

  if (subdomain?.endsWith("-admin")) {
    return `${protocol}://${host}/u/reset-password`;
  }

  if (subdomain === "super") {
    return `${protocol}://${host}/reset-password`;
  }

  return defaultPasswordResetUrl();
}

export function passwordResetUrlFromRequest(request: Request): string {
  const host = request.headers.get("host") || "";
  return passwordResetUrlFromRequestHost(host);
}