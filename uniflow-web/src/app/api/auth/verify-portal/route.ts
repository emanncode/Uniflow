import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

type Portal = "uniflow_admin" | "university_admin";

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  return authHeader?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { portal?: Portal };
    const portal = body.portal;

    if (portal !== "uniflow_admin" && portal !== "university_admin") {
      return NextResponse.json({ error: "Invalid portal" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const bearerToken = getBearerToken(req);
    const {
      data: { user },
    } = bearerToken
      ? await supabase.auth.getUser(bearerToken)
      : await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (portal === "university_admin") {
      // Check university_admins table (dedicated admin table)
      const adminClient = createAdminClient();
      const { data: adminRecord } = await adminClient
        .from("university_admins")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!adminRecord) {
        await supabase.auth.signOut();
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      return NextResponse.json({ ok: true, role: "university_admin" });
    }

    // uniflow_admin check still uses profiles.role
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "uniflow_admin") {
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