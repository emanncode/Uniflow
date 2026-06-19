import { supabase } from "@/lib/supabase";
import { getCurrentAcademicSession } from "@/lib/academic";

export async function upsertLecturerCourseAssignment(params: {
  lecturerId: string;
  courseId: string;
  universityId: string;
  semester: 1 | 2;
  academicSession?: string;
}): Promise<void> {
  const session = params.academicSession ?? getCurrentAcademicSession();

  const { data: existing } = await supabase
    .from("lecturer_courses")
    .select("id")
    .eq("lecturer_id", params.lecturerId)
    .eq("course_id", params.courseId)
    .eq("academic_session", session)
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
    academic_session: session,
    semester: params.semester,
    is_active: true,
  });
  if (error) throw error;
}

export async function syncLecturerCourseAssignments(params: {
  courseId: string;
  universityId: string;
  semester: 1 | 2;
  lecturerIds: string[];
  academicSession?: string;
}): Promise<void> {
  const session = params.academicSession ?? getCurrentAcademicSession();
  const selected = new Set(params.lecturerIds);

  const { data: existing, error: fetchError } = await supabase
    .from("lecturer_courses")
    .select("id, lecturer_id")
    .eq("course_id", params.courseId)
    .eq("academic_session", session)
    .eq("semester", params.semester);

  if (fetchError) throw fetchError;

  for (const row of existing ?? []) {
    if (!selected.has(row.lecturer_id)) {
      const { error } = await supabase
        .from("lecturer_courses")
        .update({ is_active: false })
        .eq("id", row.id);
      if (error) throw error;
    }
  }

  for (const lecturerId of params.lecturerIds) {
    await upsertLecturerCourseAssignment({
      lecturerId,
      courseId: params.courseId,
      universityId: params.universityId,
      semester: params.semester,
      academicSession: session,
    });
  }
}