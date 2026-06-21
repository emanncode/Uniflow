import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

const CACHE_TTL_MS = 60_000;

let cachedLecturerId: string | null = null;
let cachedCourseIds: string[] = [];
let cachedAt = 0;
let inflight: Promise<string[]> | null = null;

export function invalidateLecturerCourseIds() {
  cachedLecturerId = null;
  cachedCourseIds = [];
  cachedAt = 0;
  inflight = null;
}

export async function fetchLecturerCourseIds(
  lecturerId: string,
  force = false,
): Promise<string[]> {
  if (
    !force &&
    cachedLecturerId === lecturerId &&
    Date.now() - cachedAt < CACHE_TTL_MS
  ) {
    return cachedCourseIds;
  }

  if (!force && inflight) {
    return inflight;
  }

  inflight = (async () => {
    const { data, error } = await supabase
      .from("lecturer_courses")
      .select("course_id")
      .eq("lecturer_id", lecturerId)
      .eq("is_active", true);

    if (error) throw error;

    const courseIds = (data ?? []).map((row) => row.course_id);
    cachedLecturerId = lecturerId;
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

export function prefetchLecturerCourseIds(lecturerId: string) {
  void fetchLecturerCourseIds(lecturerId);
}

export function useLecturerCourseIds() {
  const profile = useAuthStore((s) => s.profile);
  const lecturerId = profile?.id;

  const [courseIds, setCourseIds] = useState<string[]>(() =>
    lecturerId && cachedLecturerId === lecturerId ? cachedCourseIds : [],
  );
  const [isLoading, setIsLoading] = useState(
    () => !(lecturerId && cachedLecturerId === lecturerId),
  );

  const refresh = useCallback(
    async (force = true) => {
      if (!lecturerId) {
        setCourseIds([]);
        return [];
      }
      const ids = await fetchLecturerCourseIds(lecturerId, force);
      setCourseIds(ids);
      return ids;
    },
    [lecturerId],
  );

  useEffect(() => {
    if (!lecturerId) {
      setCourseIds([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchLecturerCourseIds(lecturerId)
      .then((ids) => {
        if (!cancelled) setCourseIds(ids);
      })
      .catch((e) => console.error("Lecturer courses fetch error:", e))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lecturerId]);

  return { courseIds, isLoading, refresh };
}