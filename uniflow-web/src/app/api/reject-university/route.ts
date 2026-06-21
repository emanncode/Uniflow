import { createAdminClient } from "@/lib/supabase-admin";
import {
  normalizeOrThrow,
  sendEmail,
  universityRejectedEmail,
} from "@/lib/email";
import { isSuperAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authorized = await isSuperAdmin();
    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized: Only Uniflow Admins can reject universities." },
        { status: 403 },
      );
    }

    const { registrationId, reason } = await request.json();

    if (!registrationId || !reason?.trim()) {
      return NextResponse.json(
        { error: "registrationId and reason are required" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: reg, error: regError } = await supabase
      .from("university_registrations")
      .select("*")
      .eq("id", registrationId)
      .single();

    if (regError || !reg) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    let finalEmail: string;
    try {
      finalEmail = normalizeOrThrow(reg.official_email);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Invalid email address";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("university_registrations")
      .update({
        status: "rejected",
        rejection_reason: reason.trim(),
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", registrationId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    try {
      await sendEmail(
        finalEmail,
        `Update on your Uniflow application — ${reg.university_name}`,
        universityRejectedEmail(reg.university_name, reason.trim()),
      );
    } catch (emailError) {
      console.error("Reject University: failed to send rejection email:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}