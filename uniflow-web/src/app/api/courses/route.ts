import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";
import { safeErrorResponse } from "@/lib/utils";
import { requireUniversityAdmin } from "@/lib/api-auth";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const courseCreateSchema = z.object({
  university_id: z.string().min(1),
  department_id: z.string().min(1),
  title: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  level: z.number().int().min(100).max(500),
  semester: z.union([z.literal(1), z.literal(2)]),
  credit_units: z.number().int().min(1).max(10),
  description: z.string().max(1000).nullable().optional(),
});

const courseUpdateSchema = z.object({
  university_id: z.string().min(1),
  course_id: z.string().min(1),
  is_active: z.boolean().optional(),
});

const courseDeleteSchema = z.object({
  university_id: z.string().min(1),
  course_id: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = courseCreateSchema.parse(rawBody);

    const {
      university_id,
      department_id,
      title,
      code,
      level,
      semester,
      credit_units,
      description,
    } = parsed;

    const authError = await requireUniversityAdmin(university_id);
    if (authError) return authError;

    const ip = await getClientIp();
    const rateError = await rateLimit(`courses-create:${university_id}:${ip}`, 5, 60_000);
    if (rateError) return rateError;

    const supabase = createAdminClient();

    const { data: department, error: deptError } = await supabase
      .from("departments")
      .select("id")
      .eq("id", department_id)
      .eq("university_id", university_id)
      .maybeSingle();

    if (deptError || !department) {
      return NextResponse.json(
        { error: "Department not found for this university" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("courses")
      .insert({
        department_id,
        university_id,
        title: title.trim(),
        code: code.trim().toUpperCase(),
        level,
        semester,
        credit_units,
        description: description?.trim() || null,
        is_active: true,
      })
      .select("id, title, code, level, semester, credit_units")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, course: data });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = courseUpdateSchema.parse(rawBody);

    const { university_id, course_id, is_active } = parsed;

    const authError = await requireUniversityAdmin(university_id);
    if (authError) return authError;

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("courses")
      .update({ is_active: is_active ?? false })
      .eq("id", course_id)
      .eq("university_id", university_id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = courseDeleteSchema.parse(rawBody);

    const { university_id, course_id } = parsed;

    const authError = await requireUniversityAdmin(university_id);
    if (authError) return authError;

    const supabase = createAdminClient();

    const { data: course, error: courseCheck } = await supabase
      .from("courses")
      .select("id")
      .eq("id", course_id)
      .eq("university_id", university_id)
      .maybeSingle();

    if (courseCheck || !course) {
      return NextResponse.json(
        { error: courseCheck?.message || "Course not found" },
        { status: courseCheck ? 500 : 404 },
      );
    }

    const { error: delTimetable } = await supabase
      .from("timetable")
      .delete()
      .eq("course_id", course_id);

    if (delTimetable) {
      return NextResponse.json({ error: delTimetable.message }, { status: 500 });
    }

    const { error: delOfferings } = await supabase
      .from("course_offerings")
      .delete()
      .eq("course_id", course_id);

    if (delOfferings) {
      return NextResponse.json({ error: delOfferings.message }, { status: 500 });
    }

    const { error: delLecturerCourses } = await supabase
      .from("lecturer_courses")
      .delete()
      .eq("course_id", course_id);

    if (delLecturerCourses) {
      return NextResponse.json({ error: delLecturerCourses.message }, { status: 500 });
    }

    const { error: delEnrollments } = await supabase
      .from("enrollments")
      .delete()
      .eq("course_id", course_id);

    if (delEnrollments) {
      return NextResponse.json({ error: delEnrollments.message }, { status: 500 });
    }

    const { error: delCourse } = await supabase
      .from("courses")
      .delete()
      .eq("id", course_id);

    if (delCourse) {
      return NextResponse.json({ error: delCourse.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const safe = safeErrorResponse(err, "Failed to delete course");
    return NextResponse.json(safe, { status: 500 });
  }
}