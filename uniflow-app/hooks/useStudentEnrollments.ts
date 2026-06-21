import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

const CACHE_TTL_MS = 60_000;

let cachedStudentId: string | null = null;
let cachedCourseIds: string[] = [];
let cachedAt = 0;
let inflight: Promise<string[]> | null = null;

export function invalidateStudentEnrollments() {
  cachedStudentId = null;
  cachedCourseIds = [];
  cachedAt = 0;
  inflight = null;
}

export async function fetchStudentCourseIds(
  studentId: string,
  force = false,
): Promise<string[]> {
  if (
    !force &&
    cachedStudentId === studentId &&
    Date.now() - cachedAt < CACHE_TTL_MS
  ) {
    return cachedCourseIds;
  }

  if (!force && inflight) {
    return inflight;
  }

  inflight = (async () => {
    const { data, error } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", studentId)
      .eq("is_active", true);

    if (error) throw error;

    const courseIds = (data ?? []).map((row) => row.course_id);
    cachedStudentId = studentId;
    cachedCourseIds = courseIds;
    cachedAt = Date.now();
    inflight = null;
    return courseIds;
  })();

  try {
    return await inflight;
  } catch (e) {
    inflight = null;
    throw e;
  }
}

export function prefetchStudentEnrollments(studentId: string) {
  void fetchStudentCourseIds(studentId);
}

export function useStudentEnrollments() {
  const profile = useAuthStore((s) => s.profile);
  const studentId =
    profile?.role === "student" ? profile.id : undefined;

  const [courseIds, setCourseIds] = useState<string[]>(() =>
    studentId && cachedStudentId === studentId ? cachedCourseIds : [],
  );
  const [isLoading, setIsLoading] = useState(
    () => !(studentId && cachedStudentId === studentId),
  );

  const refresh = useCallback(
    async (force = true) => {
      if (!studentId) {
        setCourseIds([]);
        return [];
      }
      const ids = await fetchStudentCourseIds(studentId, force);
      setCourseIds(ids);
      return ids;
    },
    [studentId],
  );

  useEffect(() => {
    if (!studentId) {
      setCourseIds([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchStudentCourseIds(studentId)
      .then((ids) => {
        if (!cancelled) setCourseIds(ids);
      })
      .catch((e) => console.error("Student enrollments fetch error:", e))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  return { courseIds, isLoading, refresh };
}