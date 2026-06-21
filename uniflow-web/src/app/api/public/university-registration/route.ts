import { createAdminClient } from "@/lib/supabase-admin";
import {
  normalizeOrThrow,
  registrationReceivedEmail,
  sendEmail,
} from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      university_name,
      short_name,
      official_email,
      phone,
      country,
      state,
      website,
      estimated_students,
      contact_person_name,
      contact_person_role,
    } = body;

    if (!university_name?.trim() || !short_name?.trim() || !official_email?.trim()) {
      return NextResponse.json(
        { error: "University name, short name, and official email are required" },
        { status: 400 },
      );
    }

    if (!contact_person_name?.trim()) {
      return NextResponse.json(
        { error: "Contact person name is required" },
        { status: 400 },
      );
    }

    let finalOfficialEmail: string;
    try {
      finalOfficialEmail = normalizeOrThrow(official_email);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Invalid email address";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("university_registrations")
      .select("id")
      .eq("short_name", short_name.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `The short name "${short_name.trim()}" is already taken.` },
        { status: 409 },
      );
    }

    const { error: insertError } = await supabase
      .from("university_registrations")
      .insert({
        university_name: university_name.trim(),
        short_name: short_name.trim(),
        official_email: finalOfficialEmail,
        phone: phone?.trim() || null,
        country: country || "Nigeria",
        state: state || null,
        website: website?.trim() || null,
        estimated_students: estimated_students
          ? parseInt(String(estimated_students), 10)
          : null,
        contact_person_name: contact_person_name.trim(),
        contact_person_role: contact_person_role?.trim() || null,
        status: "pending",
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    try {
      await sendEmail(
        finalOfficialEmail,
        "We received your Uniflow application",
        registrationReceivedEmail(university_name.trim()),
      );
    } catch (emailError) {
      console.error(
        "University registration: failed to send confirmation email:",
        emailError,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}