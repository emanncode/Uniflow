import { createAdminClient } from "@/lib/supabase-admin";
import { generateTempPassword } from "@/lib/utils";
import { NextResponse } from "next/server";
import { validateAndNormalizeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Normalize email for lookup (handles typos in user input)
    const emailCheck = validateAndNormalizeEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.error || "Invalid email address" },
        { status: 400 },
      );
    }
    const lookupEmail = emailCheck.normalized;

    const supabase = createAdminClient();

    // 1. Check if the user exists in profiles (registered by school admin)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("email", lookupEmail)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error:
            "This email is not registered in our system. Please contact your school administrator.",
        },
        { status: 404 },
      );
    }

    // 2. Generate new temporary password
    const newPassword = generateTempPassword();

    // 3. Update user's password in Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      profile.id,
      {
        password: newPassword,
      },
    );

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      tempPassword: newPassword,
      name: profile.full_name,
      role: profile.role,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred'
    console.error('Public Temp Password Error:', message)
    return NextResponse.json({ error: `Failed to generate password: ${message}` }, { status: 500 })
  }
}
