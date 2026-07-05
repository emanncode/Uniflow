import { createAdminClient } from "@/lib/supabase-admin";
import { getCurrentAcademicSession } from "@/lib/academic";
import { upsertCourseOffering, syncLegacyLecturerCourse } from "@/lib/course-offerings-server";
import { NextResponse } from "next/server";
import { requireUniversityAdmin } from "@/lib/api-auth";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const lecturerCoursesQuerySchema = z.object({
  university_id: z.string().min(1),
  course_ids: z.string().optional(),
  academic_session: z.string().optional(),
});

const lecturerCoursesBodySchema = z.object({
  university_id: z.string().min(1),
  course_id: z.string().min(1),
  semester: z.union([z.literal(1), z.literal(2)]),
  lecturer_ids: z.array(z.string()).optional(),
  lecturer_id: z.string().optional(),
  academic_session: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = lecturerCoursesQuerySchema.parse({
      university_id: searchParams.get("university_id"),
      course_ids: searchParams.get("course_ids"),
      academic_session: searchParams.get("academic_session"),
    });

    const universityId = parsed.university_id;
    const courseIdsParam = parsed.course_ids;

    const authError = await requireUniversityAdmin(universityId);
    if (authError) return authError;

    const courseIds =
      courseIdsParam
        ?.split(",")
        .map((id) => id.trim())
        .filter(Boolean) ?? [];
    const academicSession =
      parsed.academic_session ?? getCurrentAcademicSession();

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
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: err.issues }, { status: 400 });
    }
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
    const rawBody = await req.json();
    const parsed = lecturerCoursesBodySchema.parse(rawBody);

    const {
      university_id,
      course_id,
      semester,
      lecturer_ids,
      lecturer_id,
      academic_session,
    } = parsed;

    const authError = await requireUniversityAdmin(university_id);
    if (authError) return authError;

    const ip = await getClientIp();
    const rateError = await rateLimit(`lecturer-courses:${university_id}:${ip}`, 10, 60_000);
    if (rateError) return rateError;

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
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: err.issues }, { status: 400 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to update assignments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}