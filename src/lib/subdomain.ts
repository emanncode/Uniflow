function extractPortalKey(host: string): string | null {
  if (host === "admin") return "super";
  if (host.endsWith("-admin")) return host.slice(0, -"-admin".length);
  return null;
}

export function getSubdomain(hostname: string): string | null {
  // localhost:3000 -> no subdomain
  // aaua-admin.localhost:3000 -> "aaua"
  // aaua-admin.lvh.me:3000 -> "aaua"
  // aaua-admin.uniflow.com.ng -> "aaua"
  // admin.uniflow.com.ng -> "super"

  const host = hostname.split(":")[0].toLowerCase();
  if (!host) return null;

  if (host === "localhost" || host === "127.0.0.1") return null;

  if (host.endsWith(".localhost")) {
    return extractPortalKey(host.replace(/\.localhost$/, ""));
  }

  if (host.endsWith(".lvh.me")) {
    return extractPortalKey(host.replace(/\.lvh\.me$/, ""));
  }

  if (
    host.endsWith(".127.0.0.1.nip.io") ||
    host.endsWith(".127.0.0.1.sslip.io")
  ) {
    return extractPortalKey(
      host
        .replace(/\.127\.0\.0\.1\.nip\.io$/, "")
        .replace(/\.127\.0\.0\.1\.sslip\.io$/, ""),
    );
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
