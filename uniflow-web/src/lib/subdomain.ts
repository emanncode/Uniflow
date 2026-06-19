function extractPortalKey(host: string): string | null {
  if (host === "admin") return "super";
  if (host.endsWith("-admin")) return host.slice(0, -"-admin".length);
  return null;
}

export function getSubdomain(hostname: string): string | null {
  // localhost:3000 -> no subdomain (marketing + super-admin login)
  // uni-admin.localhost:3000 -> "uni"
  // uni-admin.uniflowapp.xyz -> "uni"
  // admin.uniflowapp.xyz -> "super"

  const host = hostname.split(":")[0].toLowerCase();
  if (!host) return null;

  if (host === "localhost") return null;

  if (host.endsWith(".localhost")) {
    return extractPortalKey(host.replace(/\.localhost$/, ""));
  }

  const parts = host.split(".");
  if (parts.length < 3) return null;

  return extractPortalKey(parts[0]);
}

export function isUniversityPortal(hostname: string): boolean {
  const sub = getSubdomain(hostname);
  return sub !== null && sub !== "super";
}

export function isSuperAdmin(hostname: string): boolean {
  return getSubdomain(hostname) === "super";
}