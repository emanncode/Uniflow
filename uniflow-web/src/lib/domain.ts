/** Apex domain for Uniflow (marketing site + wildcard subdomains). */
export const BASE_DOMAIN =
  process.env.NEXT_PUBLIC_BASE_DOMAIN?.toLowerCase() || "uniflow.xyz";

/** Public marketing / app URL (no trailing slash). */
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  `https://${BASE_DOMAIN}`
);

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

/** Resolve base domain for auth redirect URLs in API routes (localhost dev). */
export function resolveBaseDomainFromRequestHost(host: string): string {
  const h = host.toLowerCase();
  if (h.includes("lvh.me")) return "lvh.me:3000";
  if (h.includes("localhost") || h.includes("127.0.0.1")) {
    return "localhost:3000";
  }
  return BASE_DOMAIN;
}

export function resolveProtocolFromRequestHost(host: string): "http" | "https" {
  const h = host.toLowerCase();
  if (
    h.includes("localhost") ||
    h.includes("lvh.me") ||
    h.includes("127.0.0.1")
  ) {
    return "http";
  }
  return "https";
}