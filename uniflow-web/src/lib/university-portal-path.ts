/** Public routes on the university admin portal (with and without /u rewrite). */
const PUBLIC_UNIVERSITY_PATHS = new Set([
  "/login",
  "/reset-password",
  "/u/login",
  "/u/reset-password",
]);

/**
 * Normalize the browser pathname to the internal /u/* route used by app files.
 * On uni-admin subdomains the proxy rewrites /faculties → /u/faculties.
 */
export function normalizeUniversityPortalPath(pathname: string): string {
  if (pathname === "/") return "/u";
  if (pathname === "/u" || pathname.startsWith("/u/")) return pathname;
  return `/u${pathname}`;
}

export function isUniversityPublicPath(pathname: string): boolean {
  return PUBLIC_UNIVERSITY_PATHS.has(pathname);
}

/** Match sidebar nav item against the current route (supports nested pages). */
export function isUniversityNavActive(pathname: string, href: string): boolean {
  const normalized = normalizeUniversityPortalPath(pathname);

  if (href === "/u") {
    return normalized === "/u";
  }

  return normalized === href || normalized.startsWith(`${href}/`);
}

export function universityPortalLoginPath(): string {
  return "/login";
}