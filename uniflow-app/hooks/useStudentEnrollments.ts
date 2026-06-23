import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAcademicContext } from "@/lib/academic";
import { useAuthStore } from "@/store/useAuthStore";

const CACHE_TTL_MS = 60_000;

export type StudentEnrollmentContext = {
  courseIds: string[];
  offeringIds: string[];
};

let cachedStudentId: string | null = null;
let cachedContext: StudentEnrollmentContext = { courseIds: [], offeringIds: [] };
let cachedAt = 0;
let inflight: Promise<StudentEnrollmentContext> | null = null;

export function invalidateStudentEnrollments() {
  cachedStudentId = null;
  cachedContext = { courseIds: [], offeringIds: [] };
  cachedAt = 0;
  inflight = null;
}

export async function fetchStudentEnrollmentContext(
  studentId: string,
  force = false,
): Promise<StudentEnrollmentContext> {
  if (
    !force &&
    cachedStudentId === studentId &&
    Date.now() - cachedAt < CACHE_TTL_MS
  ) {
    return cachedContext;
  }

  if (!force && inflight) {
    return inflight;
  }

  inflight = (async () => {
    const { academic_session, semester } = getAcademicContext();

    const { data, error } = await supabase
      .from("enrollments")
      .select("course_id, course_offering_id")
      .eq("student_id", studentId)
      .eq("is_active", true)
      .eq("academic_session", academic_session)
      .eq("semester", semester);

    if (error) throw error;

    const courseIds = [
      ...new Set((data ?? []).map((row) => row.course_id).filter(Boolean)),
    ] as string[];
    const offeringIds = [
      ...new Set(
        (data ?? [])
          .map((row) => row.course_offering_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    cachedStudentId = studentId;
    cachedContext = { courseIds, offeringIds };
    cachedAt = Date.now();
    inflight = null;
    return cachedContext;
  })();

  try {
    return await inflight;
  } catch (e) {
    inflight = null;
    throw e;
  }
}

export function prefetchStudentEnrollments(studentId: string) {
  void fetchStudentEnrollmentContext(studentId);
}

export function useStudentEnrollments() {
  const profile = useAuthStore((s) => s.profile);
  const studentId =
    profile?.role === "student" ? profile.id : undefined;

  const [context, setContext] = useState<StudentEnrollmentContext>(() =>
    studentId && cachedStudentId === studentId
      ? cachedContext
      : { courseIds: [], offeringIds: [] },
  );
  const [isLoading, setIsLoading] = useState(
    () => !(studentId && cachedStudentId === studentId),
  );

  const refresh = useCallback(
    async (force = true) => {
      if (!studentId) {
        setContext({ courseIds: [], offeringIds: [] });
        return { courseIds: [], offeringIds: [] };
      }
      const next = await fetchStudentEnrollmentContext(studentId, force);
      setContext(next);
      return next;
    },
    [studentId],
  );

  useEffect(() => {
    if (!studentId) {
      setContext({ courseIds: [], offeringIds: [] });
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchStudentEnrollmentContext(studentId)
      .then((next) => {
        if (!cancelled) setContext(next);
      })
      .catch((e) => console.error("Student enrollments fetch error:", e))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  return {
    courseIds: context.courseIds,
    offeringIds: context.offeringIds,
    isLoading,
    refresh,
  };
}