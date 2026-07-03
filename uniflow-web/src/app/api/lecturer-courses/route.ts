import { createAdminClient } from "@/lib/supabase-admin";
import { canManageUniversity } from "@/lib/auth";
import { getCurrentAcademicSession } from "@/lib/academic";
import { upsertCourseOffering, syncLegacyLecturerCourse } from "@/lib/course-offerings-server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get("university_id");
    const courseIdsParam = searchParams.get("course_ids");

    if (!universityId) {
      return NextResponse.json(
        { error: "university_id is required" },
        { status: 400 },
      );
    }

    if (!(await canManageUniversity(universityId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const courseIds =
      courseIdsParam
        ?.split(",")
        .map((id) => id.trim())
        .filter(Boolean) ?? [];
    const academicSession =
      searchParams.get("academic_session") ?? getCurrentAcademicSession();

    const supabase = createAdminClient();

    let query = supabase
      .from("lecturer_courses")
      .select("course_id, lecturer_id")
      .eq("academic_session", academicSession)
      .eq("is_active", true);

    if (courseIds.length > 0) {
      query = query.in("course_id", courseIds);
    }

    const { data: rows, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const lecturerIds = [
      ...new Set((rows ?? []).map((row) => row.lecturer_id)),
    ];
    const nameById = new Map<string, string>();

    if (lecturerIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", lecturerIds)
        .eq("university_id", universityId);

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 },
        );
      }

      for (const profile of profiles ?? []) {
        nameById.set(profile.id, profile.full_name);
      }
    }

    const data: Record<string, { id: string; full_name: string }[]> = {};
    for (const row of rows ?? []) {
      const fullName = nameById.get(row.lecturer_id);
      if (!fullName) continue;
      if (!data[row.course_id]) data[row.course_id] = [];
      data[row.course_id].push({
        id: row.lecturer_id,
        full_name: fullName,
      });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load assignments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
  // Resolve department from the course (required for offerings)
  const { data: course } = await supabase
    .from("courses")
    .select("department_id")
    .eq("id", params.courseId)
    .maybeSingle();

  const deptId = course?.department_id || "";

  // Keep course_offerings as source of truth for mobile
  if (deptId) {
    await upsertCourseOffering(supabase, {
      course_id: params.courseId,
      lecturer_id: params.lecturerId,
      department_id: deptId,
      university_id: params.universityId,
      academic_session: params.academicSession,
      semester: params.semester,
    });
  }

  // Also keep legacy in sync
  await syncLegacyLecturerCourse(supabase, {
    course_id: params.courseId,
    lecturer_id: params.lecturerId,
    university_id: params.universityId,
    academic_session: params.academicSession,
    semester: params.semester,
  });

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

  const payload: Record<string, unknown> = {
    lecturer_id: params.lecturerId,
    course_id: params.courseId,
    academic_session: params.academicSession,
    semester: params.semester,
    is_active: true,
  };

  let { error } = await supabase.from("lecturer_courses").insert({
    ...payload,
    university_id: params.universityId,
  });

  if (error?.message?.includes('column "university_id"')) {
    ({ error } = await supabase.from("lecturer_courses").insert(payload));
  }

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