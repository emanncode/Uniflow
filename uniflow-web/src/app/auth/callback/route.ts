import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function safeNextPath(next: string | null, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

function redirectWithAuthError(
  origin: string,
  next: string,
  description: string,
): NextResponse {
  const url = new URL(safeNextPath(next, "/reset-password"), origin);
  url.searchParams.set("error", "access_denied");
  url.searchParams.set("error_code", "otp_expired");
  url.searchParams.set("error_description", description);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/reset-password");

  const authError = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  if (authError || errorCode) {
    return redirectWithAuthError(
      origin,
      next,
      errorDescription?.replace(/\+/g, " ") ||
        "This reset link is invalid or has expired.",
    );
  }

  if (!code) {
    return redirectWithAuthError(
      origin,
      next,
      "Missing verification code. Request a new reset link.",
    );
  }

  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return redirectWithAuthError(origin, next, exchangeError.message);
  }

  return response;
}