import { createAdminClient } from "@/lib/supabase-admin";
import { canManageUniversity } from "@/lib/auth";
import { getCurrentAcademicSession } from "@/lib/academic";
import { NextResponse } from "next/server";

async function upsertAssignment(
  supabase: ReturnType<typeof createAdminClient>,
  params: {
    lecturerId: string;
    courseId: string;
    universityId: string;
    semester: 1 | 2;
    academicSession: string;
  },
) {
  const { data: existing } = await supabase
    .from("lecturer_courses")
    .select("id")
    .eq("lecturer_id", params.lecturerId)
    .eq("course_id", params.courseId)
    .eq("academic_session", params.academicSession)
    .eq("semester", params.semester)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("lecturer_courses")
      .update({ is_active: true })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("lecturer_courses").insert({
    lecturer_id: params.lecturerId,
    course_id: params.courseId,
    university_id: params.universityId,
    academic_session: params.academicSession,
    semester: params.semester,
    is_active: true,
  });
  if (error) throw error;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      university_id,
      course_id,
      semester,
      lecturer_ids,
      lecturer_id,
      academic_session,
    } = body as {
      university_id?: string;
      course_id?: string;
      semester?: 1 | 2;
      lecturer_ids?: string[];
      lecturer_id?: string;
      academic_session?: string;
    };

    if (!university_id || !course_id || !semester) {
      return NextResponse.json(
        { error: "university_id, course_id, and semester are required" },
        { status: 400 },
      );
    }

    if (!(await canManageUniversity(university_id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const session = academic_session ?? getCurrentAcademicSession();
    const supabase = createAdminClient();

    if (lecturer_ids) {
      const selected = new Set(lecturer_ids);
      const { data: existing, error: fetchError } = await supabase
        .from("lecturer_courses")
        .select("id, lecturer_id")
        .eq("course_id", course_id)
        .eq("academic_session", session)
        .eq("semester", semester);

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      for (const row of existing ?? []) {
        if (!selected.has(row.lecturer_id)) {
          const { error } = await supabase
            .from("lecturer_courses")
            .update({ is_active: false })
            .eq("id", row.id);
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
        }
      }

      for (const id of lecturer_ids) {
        await upsertAssignment(supabase, {
          lecturerId: id,
          courseId: course_id,
          universityId: university_id,
          semester,
          academicSession: session,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (lecturer_id) {
      await upsertAssignment(supabase, {
        lecturerId: lecturer_id,
        courseId: course_id,
        universityId: university_id,
        semester,
        academicSession: session,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "lecturer_ids or lecturer_id is required" },
      { status: 400 },
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update assignments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}