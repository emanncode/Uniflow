import type { createAdminClient } from "@/lib/supabase-admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export type AutoEnrollResult = {
  offerings_matched: number;
  students_matched: number;
  enrollments_created: number;
  enrollments_reactivated: number;
};

/**
 * Auto-enroll active students into offerings that match their department + level + semester.
 */
export async function autoEnrollDepartment(
  supabase: AdminClient,
  params: {
    university_id: string;
    department_id: string;
    academic_session: string;
    semester: 1 | 2;
  },
): Promise<AutoEnrollResult> {
  const result: AutoEnrollResult = {
    offerings_matched: 0,
    students_matched: 0,
    enrollments_created: 0,
    enrollments_reactivated: 0,
  };

  const { data: offerings, error: offeringError } = await supabase
    .from("course_offerings")
    .select("id, course_id, courses!inner(level, semester)")
    .eq("university_id", params.university_id)
    .eq("department_id", params.department_id)
    .eq("academic_session", params.academic_session)
    .eq("semester", params.semester)
    .eq("is_active", true);

  if (offeringError) throw offeringError;
  if (!offerings?.length) return result;

  result.offerings_matched = offerings.length;

  const { data: students, error: studentError } = await supabase
    .from("profiles")
    .select("id, level")
    .eq("university_id", params.university_id)
    .eq("department_id", params.department_id)
    .eq("role", "student")
    .eq("is_active", true);

  if (studentError) throw studentError;
  if (!students?.length) return result;

  result.students_matched = students.length;

  for (const student of students) {
    const studentLevel = student.level;
    if (studentLevel == null) continue;

    const matchingOfferings = offerings.filter((o) => {
      const raw = o.courses as
        | { level: number; semester: number }
        | { level: number; semester: number }[]
        | null;
      const course = Array.isArray(raw) ? raw[0] : raw;
      if (!course) return false;
      return course.level === studentLevel && course.semester === params.semester;
    });

    for (const offering of matchingOfferings) {
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id, is_active")
        .eq("student_id", student.id)
        .eq("course_offering_id", offering.id)
        .maybeSingle();

      if (existing) {
        if (!existing.is_active) {
          await supabase
            .from("enrollments")
            .update({ is_active: true })
            .eq("id", existing.id);
          result.enrollments_reactivated += 1;
        }
        continue;
      }

      const { error: insertError } = await supabase.from("enrollments").insert({
        student_id: student.id,
        course_id: offering.course_id,
        course_offering_id: offering.id,
        university_id: params.university_id,
        academic_session: params.academic_session,
        semester: params.semester,
        is_active: true,
      });

      if (!insertError) {
        result.enrollments_created += 1;
      }
    }
  }

  return result;
}