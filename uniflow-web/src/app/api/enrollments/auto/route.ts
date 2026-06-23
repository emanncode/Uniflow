import { createAdminClient } from "@/lib/supabase-admin";
import { canManageUniversity } from "@/lib/auth";
import { getAcademicContext } from "@/lib/academic";
import { autoEnrollDepartment } from "@/lib/enrollments-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      university_id,
      department_id,
      academic_session: sessionOverride,
      semester: semesterOverride,
    } = body as {
      university_id?: string;
      department_id?: string;
      academic_session?: string;
      semester?: 1 | 2;
    };

    if (!university_id || !department_id) {
      return NextResponse.json(
        { error: "university_id and department_id are required" },
        { status: 400 },
      );
    }

    if (!(await canManageUniversity(university_id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const ctx = getAcademicContext();
    const supabase = createAdminClient();

    const result = await autoEnrollDepartment(supabase, {
      university_id,
      department_id,
      academic_session: sessionOverride ?? ctx.academic_session,
      semester: semesterOverride ?? ctx.semester,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Auto-enroll failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}