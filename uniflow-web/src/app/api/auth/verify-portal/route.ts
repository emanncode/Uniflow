import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getProfileForUser } from "@/lib/profile-server";

type Portal = "uniflow_admin" | "university_admin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { portal?: Portal };
    const portal = body.portal;

    if (portal !== "uniflow_admin" && portal !== "university_admin") {
      return NextResponse.json({ error: "Invalid portal" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const profile = await getProfileForUser(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: "Could not load profile" },
        { status: 500 },
      );
    }

    if (profile.role !== portal) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, role: profile.role });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 },
    );
  }
}