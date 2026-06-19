/** Apex domain for production (marketing site + wildcard subdomains). */
export const BASE_DOMAIN =
  process.env.NEXT_PUBLIC_BASE_DOMAIN?.toLowerCase() || "uniflowapp.xyz";

/** Public marketing / app URL (no trailing slash). */
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  `https://${BASE_DOMAIN}`
);

/** Local dev portal base — e.g. uni-admin.localhost:3000 */
export const LOCAL_PORTAL_BASE = "localhost:3000";

export function universityPortalHost(shortName: string): string {
  return `${shortName}-admin.${BASE_DOMAIN}`;
}

export function universityPortalUrl(
  shortName: string,
  path = "",
): string {
  const normalized = path && !path.startsWith("/") ? `/${path}` : path;
  return `https://${universityPortalHost(shortName)}${normalized}`;
}

export function superAdminHost(): string {
  return `admin.${BASE_DOMAIN}`;
}

export function superAdminUrl(path = ""): string {
  const normalized = path && !path.startsWith("/") ? `/${path}` : path;
  return `https://${superAdminHost()}${normalized}`;
}

/** Resolve base host for auth redirect URLs in API routes. */
export function resolveBaseDomainFromRequestHost(host: string): string {
  if (host.toLowerCase().includes("localhost")) {
    return LOCAL_PORTAL_BASE;
  }
  return BASE_DOMAIN;
}

export function resolveProtocolFromRequestHost(host: string): "http" | "https" {
  return host.toLowerCase().includes("localhost") ? "http" : "https";
}