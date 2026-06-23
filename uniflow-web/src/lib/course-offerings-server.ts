import type { createAdminClient } from "@/lib/supabase-admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export async function upsertCourseOffering(
  supabase: AdminClient,
  params: {
    course_id: string;
    lecturer_id: string;
    department_id: string;
    university_id: string;
    academic_session: string;
    semester: 1 | 2;
  },
) {
  const { data: existing } = await supabase
    .from("course_offerings")
    .select("id")
    .eq("course_id", params.course_id)
    .eq("lecturer_id", params.lecturer_id)
    .eq("academic_session", params.academic_session)
    .eq("semester", params.semester)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("course_offerings")
      .update({ is_active: true })
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  }

  const { data, error } = await supabase
    .from("course_offerings")
    .insert({
      course_id: params.course_id,
      lecturer_id: params.lecturer_id,
      department_id: params.department_id,
      university_id: params.university_id,
      academic_session: params.academic_session,
      semester: params.semester,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

/** Keep lecturer_courses in sync during phased migration. */
export async function syncLegacyLecturerCourse(
  supabase: AdminClient,
  params: {
    course_id: string;
    lecturer_id: string;
    university_id: string;
    academic_session: string;
    semester: 1 | 2;
  },
) {
  const { data: existing } = await supabase
    .from("lecturer_courses")
    .select("id")
    .eq("course_id", params.course_id)
    .eq("lecturer_id", params.lecturer_id)
    .eq("academic_session", params.academic_session)
    .eq("semester", params.semester)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("lecturer_courses")
      .update({ is_active: true })
      .eq("id", existing.id);
    return;
  }

  const payload: Record<string, unknown> = {
    lecturer_id: params.lecturer_id,
    course_id: params.course_id,
    academic_session: params.academic_session,
    semester: params.semester,
    is_active: true,
  };

  let { error } = await supabase.from("lecturer_courses").insert({
    ...payload,
    university_id: params.university_id,
  });

  if (error?.message?.includes('column "university_id"')) {
    ({ error } = await supabase.from("lecturer_courses").insert(payload));
  }

  if (error) throw error;
}

export async function findOrCreateCourse(
  supabase: AdminClient,
  params: {
    university_id: string;
    department_id: string;
    code: string;
    title: string;
    level: number;
    semester: 1 | 2;
    credit_units: number;
  },
) {
  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .eq("university_id", params.university_id)
    .eq("department_id", params.department_id)
    .eq("code", params.code)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("courses")
      .update({
        title: params.title,
        level: params.level,
        semester: params.semester,
        credit_units: params.credit_units,
        is_active: true,
      })
      .eq("id", existing.id);
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("courses")
    .insert({
      university_id: params.university_id,
      department_id: params.department_id,
      code: params.code,
      title: params.title,
      level: params.level,
      semester: params.semester,
      credit_units: params.credit_units,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}