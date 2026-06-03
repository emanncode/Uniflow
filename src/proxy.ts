import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSubdomain,
  isSuperAdmin,
  isUniversityPortal,
} from "@/lib/subdomain";

const publicRoutes = ["/", "/register", "/login"];
const authRoutes = ["/login", "/register"];

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
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Bare localhost or the primary app host uses normal top-level routing.
  if (!subdomain) {
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "uniflow_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  if (isUniversityPortal(hostname)) {
    if (pathname === "/u" || pathname.startsWith("/u/")) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === "/u" ? "/" : pathname.replace(/^\/u/, "");
      return NextResponse.redirect(url);
    }

    if (!user) {
      if (pathname === "/login") {
        return rewriteWithCookies(request, supabaseResponse, "/u/login");
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, university_id, universities(short_name)")
      .eq("id", user.id)
      .single();

    const allowedRoles = ["university_admin", "dean", "hod"];
    if (!profile || !allowedRoles.includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
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