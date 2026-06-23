import { createAdminClient } from "@/lib/supabase-admin";
import { canManageUniversity } from "@/lib/auth";
import { getAcademicContext } from "@/lib/academic";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get("university_id");
    const departmentId = searchParams.get("department_id");
    const ctx = getAcademicContext();
    const academicSession =
      searchParams.get("academic_session") ?? ctx.academic_session;
    const semester = Number(
      searchParams.get("semester") ?? ctx.semester,
    ) as 1 | 2;

    if (!universityId) {
      return NextResponse.json(
        { error: "university_id is required" },
        { status: 400 },
      );
    }

    if (!(await canManageUniversity(universityId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = createAdminClient();
    let query = supabase
      .from("course_offerings")
      .select(
        `
        id,
        course_id,
        lecturer_id,
        department_id,
        academic_session,
        semester,
        is_active,
        courses ( id, code, title, level, semester, credit_units ),
        profiles:lecturer_id ( id, full_name, email )
      `,
      )
      .eq("university_id", universityId)
      .eq("academic_session", academicSession)
      .eq("semester", semester)
      .eq("is_active", true);

    if (departmentId) {
      query = query.eq("department_id", departmentId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load offerings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}