import { APP_URL, resolveBaseDomainFromRequestHost, resolveProtocolFromRequestHost } from "@/lib/domain";
import { getSubdomain } from "@/lib/subdomain";

function authCallbackUrl(origin: string, nextPath: string): string {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", nextPath);
  return url.toString();
}

/** Canonical reset page for mobile users and apex-domain auth emails. */
export function defaultPasswordResetUrl(): string {
  return authCallbackUrl(APP_URL, "/reset-password");
}

/** Reset URL that matches the portal the user is on (university subdomain vs apex). */
export function passwordResetUrlFromRequestHost(host: string): string {
  const protocol = resolveProtocolFromRequestHost(host);
  const subdomain = getSubdomain(host);
  const origin = `${protocol}://${host}`;

  if (subdomain?.endsWith("-admin")) {
    return authCallbackUrl(origin, "/u/reset-password");
  }

  if (subdomain === "super") {
    return authCallbackUrl(origin, "/reset-password");
  }

  return defaultPasswordResetUrl();
}

export function passwordResetUrlFromRequest(request: Request): string {
  const host = request.headers.get("host") || "";
  return passwordResetUrlFromRequestHost(host);
}