import { getCurrentAcademicSession } from "@/lib/academic";

async function parseApiError(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return (
    (data as { error?: string }).error ||
    `Request failed (${res.status})`
  );
}

export async function upsertLecturerCourseAssignment(params: {
  lecturerId: string;
  courseId: string;
  universityId: string;
  semester: 1 | 2;
  academicSession?: string;
}): Promise<void> {
  const res = await fetch("/api/lecturer-courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      university_id: params.universityId,
      course_id: params.courseId,
      semester: params.semester,
      lecturer_id: params.lecturerId,
      academic_session: params.academicSession ?? getCurrentAcademicSession(),
    }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}

export async function syncLecturerCourseAssignments(params: {
  courseId: string;
  universityId: string;
  semester: 1 | 2;
  lecturerIds: string[];
  academicSession?: string;
}): Promise<void> {
  const res = await fetch("/api/lecturer-courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      university_id: params.universityId,
      course_id: params.courseId,
      semester: params.semester,
      lecturer_ids: params.lecturerIds,
      academic_session: params.academicSession ?? getCurrentAcademicSession(),
    }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}