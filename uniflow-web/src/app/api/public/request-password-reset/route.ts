import { createAdminClient } from "@/lib/supabase-admin";
import { validateAndNormalizeEmail } from "@/lib/email";
import { passwordResetUrlFromRequest } from "@/lib/password-reset";
import { passwordResetPortalFromRequest } from "@/lib/password-reset-context";
import { canRequestPasswordReset } from "@/lib/role-access";
import { NextResponse } from "next/server";

const GENERIC_SUCCESS =
  "If this email is registered, a password reset link has been sent.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, portal: bodyPortal } = body ?? {};

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailCheck = validateAndNormalizeEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.error || "Invalid email address" },
        { status: 400 },
      );
    }

    const lookupEmail = emailCheck.normalized;
    const host = req.headers.get("host") || "";
    const resetPortal = passwordResetPortalFromRequest(host, bodyPortal);
    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", lookupEmail)
      .maybeSingle();

    if (!profile || !canRequestPasswordReset(profile.role, resetPortal)) {
      return NextResponse.json({ success: true, message: GENERIC_SUCCESS });
    }

    const redirectTo = passwordResetUrlFromRequest(req);
    const { error } = await supabase.auth.resetPasswordForEmail(lookupEmail, {
      redirectTo,
    });

    if (error) {
      console.error("Request password reset error:", error.message);
      return NextResponse.json(
        { error: "Unable to send reset email. Try again later." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: GENERIC_SUCCESS });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Request password reset error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}