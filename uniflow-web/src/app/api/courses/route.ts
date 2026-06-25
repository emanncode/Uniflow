import { createAdminClient } from "@/lib/supabase-admin";
import { canManageUniversity } from "@/lib/auth";
import { NextResponse } from "next/server";

type CoursePayload = {
  university_id: string;
  department_id: string;
  title: string;
  code: string;
  level: number;
  semester: 1 | 2;
  credit_units: number;
  description?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CoursePayload;
    const {
      university_id,
      department_id,
      title,
      code,
      level,
      semester,
      credit_units,
      description,
    } = body;

    if (!university_id || !department_id || !title?.trim() || !code?.trim()) {
      return NextResponse.json(
        { error: "university_id, department_id, title, and code are required" },
        { status: 400 },
      );
    }

    if (!(await canManageUniversity(university_id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
    const body = await req.json();
    const { university_id, course_id, is_active } = body as {
      university_id?: string;
      course_id?: string;
      is_active?: boolean;
    };

    if (!university_id || !course_id) {
      return NextResponse.json(
        { error: "university_id and course_id are required" },
        { status: 400 },
      );
    }

    if (!(await canManageUniversity(university_id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
    const body = await req.json();
    const { university_id, course_id } = body as {
      university_id?: string;
      course_id?: string;
    };

    if (!university_id || !course_id) {
      return NextResponse.json(
        { error: "university_id and course_id are required" },
        { status: 400 },
      );
    }

    if (!(await canManageUniversity(university_id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
    const message =
      err instanceof Error ? err.message : "Failed to delete course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}