import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSubdomain,
  isSuperAdmin,
  isUniversityPortal,
} from "@/lib/subdomain";
import { getProfileForUser } from "@/lib/profile-server";

const publicRoutes = [
  "/",
  "/register",
  "/login",
  "/reset-password",
  "/auth/callback",
];
const authRoutes = ["/login", "/register"];

/** Share auth cookies across localhost and *.localhost in local dev. */
function withLocalCookieDomain(
  hostname: string,
  options?: Parameters<NextResponse["cookies"]["set"]>[2],
) {
  const host = hostname.split(":")[0].toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) {
    return { ...options, domain: ".localhost", path: "/" };
  }
  return options;
}

function rewriteWithCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;

  const rewriteResponse = NextResponse.rewrite(url, { request });
  response.cookies.getAll().forEach((cookie) => {
    rewriteResponse.cookies.set(cookie);
  });

  return rewriteResponse;
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;
  const subdomain = getSubdomain(hostname);

  let supabaseResponse = NextResponse.next({ request });

  // always let API routes through
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  if (pathname === "/forgot-password") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              withLocalCookieDomain(hostname, options),
            ),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Bare localhost or the primary app host uses normal top-level routing.
  // Admin-only routes (/login on root host → admin, /dashboard*) must be
  // served from admin.localhost:3000 (dev) or admin.uniflow.xyz (prod).
  if (!subdomain) {
    const isLocalhost = hostname.split(":")[0].toLowerCase() === "localhost";

    // In local dev, redirect admin paths to admin.localhost:3000
    if (isLocalhost) {
      const adminPaths = ["/dashboard", "/login"];
      const isDashboard = pathname.startsWith("/dashboard");
      // Only redirect /login if no subdomain AND it looks like an admin login attempt
      // (i.e. they are already authed as uniflow_admin or going to /dashboard)
      if (isDashboard) {
        const adminUrl = new URL(request.url);
        adminUrl.host = `admin.localhost:3000`;
        return NextResponse.redirect(adminUrl);
      }
    }

    if (user && authRoutes.includes(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (!user && !publicRoutes.includes(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  if (isSuperAdmin(hostname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const profile = await getProfileForUser(user.id);

    if (profile?.role !== "uniflow_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  if (isUniversityPortal(hostname)) {
    if (pathname === "/unauthorized") {
      return supabaseResponse;
    }

    if (pathname === "/u" || pathname.startsWith("/u/")) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === "/u" ? "/" : pathname.replace(/^\/u/, "");
      return NextResponse.redirect(url);
    }

    if (!user) {
      if (pathname === "/login") {
        return rewriteWithCookies(request, supabaseResponse, "/u/login");
      }

      if (pathname === "/reset-password") {
        return rewriteWithCookies(request, supabaseResponse, "/u/reset-password");
      }

      if (pathname === "/auth/callback") {
        return supabaseResponse;
      }

      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    const profile = await getProfileForUser(user.id, {
      includeUniversity: true,
    });

    const allowedRoles = ["university_admin"];
    if (!profile || !allowedRoles.includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    const universityShortName = (
      profile.universities as { short_name?: string } | null
    )?.short_name;
    if (!universityShortName || universityShortName !== subdomain) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      url.searchParams.set("reason", "wrong-portal");
      return NextResponse.redirect(url);
    }

    const internalPath = pathname === "/" ? "/u" : `/u${pathname}`;
    return rewriteWithCookies(request, supabaseResponse, internalPath);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};