import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAcademicContext } from "@/lib/academic";
import { useAuthStore } from "@/store/useAuthStore";

const CACHE_TTL_MS = 60_000;

export type LecturerTeachingContext = {
  courseIds: string[];
  offeringIds: string[];
};

let cachedLecturerId: string | null = null;
let cachedContext: LecturerTeachingContext = { courseIds: [], offeringIds: [] };
let cachedAt = 0;
let inflight: Promise<LecturerTeachingContext> | null = null;

export function invalidateLecturerCourseIds() {
  cachedLecturerId = null;
  cachedContext = { courseIds: [], offeringIds: [] };
  cachedAt = 0;
  inflight = null;
}

async function loadFromOfferings(
  lecturerId: string,
): Promise<LecturerTeachingContext> {
  const { academic_session, semester } = getAcademicContext();

  const { data, error } = await supabase
    .from("course_offerings")
    .select("id, course_id")
    .eq("lecturer_id", lecturerId)
    .eq("is_active", true)
    .eq("academic_session", academic_session)
    .eq("semester", semester);

  console.log('[loadFromOfferings] raw data length:', (data ?? []).length, 'for lecturer', lecturerId, 'session:', academic_session, semester);

  if (error) throw error;

  let context = {
    courseIds: [...new Set((data ?? []).map((r) => r.course_id))],
    offeringIds: (data ?? []).map((r) => r.id),
  };

  // Debug: if empty, check if any data exists ignoring session
  if (context.courseIds.length === 0) {
    const { data: allData } = await supabase
      .from("course_offerings")
      .select("id, course_id, academic_session, semester")
      .eq("lecturer_id", lecturerId)
      .eq("is_active", true);
    console.log('[loadFromOfferings] NO DATA FOR CURRENT SESSION. All offerings for lecturer (ignoring session):', allData);
  }

  return context;
}

async function loadFromLegacy(
  lecturerId: string,
): Promise<LecturerTeachingContext> {
  const { academic_session, semester } = getAcademicContext();

  const { data, error } = await supabase
    .from("lecturer_courses")
    .select("course_id")
    .eq("lecturer_id", lecturerId)
    .eq("is_active", true)
    .eq("academic_session", academic_session)
    .eq("semester", semester);

  console.log('[loadFromLegacy] raw data length:', (data ?? []).length, 'for lecturer', lecturerId, 'session:', academic_session, semester);

  if (error) throw error;

  // Debug if empty
  if ((data ?? []).length === 0) {
    const { data: allLegacy } = await supabase
      .from("lecturer_courses")
      .select("course_id, academic_session, semester")
      .eq("lecturer_id", lecturerId)
      .eq("is_active", true);
    console.log('[loadFromLegacy] NO LEGACY FOR SESSION. All legacy for lecturer:', allLegacy);
  }

  const courseIds = (data ?? []).map((row) => row.course_id);
  return { courseIds, offeringIds: [] };
}

export async function fetchLecturerTeachingContext(
  lecturerId: string,
  force = false,
): Promise<LecturerTeachingContext> {
  if (
    !force &&
    cachedLecturerId === lecturerId &&
    Date.now() - cachedAt < CACHE_TTL_MS
  ) {
    return cachedContext;
  }

  if (!force && inflight) {
    return inflight;
  }

  inflight = (async () => {
    let next: LecturerTeachingContext;
    try {
      next = await loadFromOfferings(lecturerId);
      if (next.courseIds.length === 0) {
        next = await loadFromLegacy(lecturerId);
      }
    } catch {
      next = await loadFromLegacy(lecturerId);
    }

    cachedLecturerId = lecturerId;
    cachedContext = next;
    cachedAt = Date.now();
    inflight = null;
    return next;
  })();

  try {
    return await inflight;
  } catch (e) {
    inflight = null;
    throw e;
  }
}

/** @deprecated use fetchLecturerTeachingContext */
export async function fetchLecturerCourseIds(
  lecturerId: string,
  force = false,
): Promise<string[]> {
  const ctx = await fetchLecturerTeachingContext(lecturerId, force);
  return ctx.courseIds;
}

export function prefetchLecturerCourseIds(lecturerId: string) {
  void fetchLecturerTeachingContext(lecturerId);
}

export function useLecturerCourseIds() {
  const profile = useAuthStore((s) => s.profile);
  const lecturerId = profile?.id;

  const [context, setContext] = useState<LecturerTeachingContext>(() =>
    lecturerId && cachedLecturerId === lecturerId
      ? cachedContext
      : { courseIds: [], offeringIds: [] },
  );
  const [isLoading, setIsLoading] = useState(
    () => !(lecturerId && cachedLecturerId === lecturerId),
  );

  const refresh = useCallback(
    async (force = true) => {
      if (!lecturerId) {
        setContext({ courseIds: [], offeringIds: [] });
        return { courseIds: [], offeringIds: [] };
      }
      const next = await fetchLecturerTeachingContext(lecturerId, force);
      console.log('[useLecturerCourseIds] refreshed context:', next, 'for lecturer', lecturerId);
      setContext(next);
      return next;
    },
    [lecturerId],
  );

  useEffect(() => {
    if (!lecturerId) {
      setContext({ courseIds: [], offeringIds: [] });
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchLecturerTeachingContext(lecturerId)
      .then((next) => {
        if (!cancelled) setContext(next);
      })
      .catch((e) => console.error("Lecturer offerings fetch error:", e))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lecturerId]);

  return {
    courseIds: context.courseIds,
    offeringIds: context.offeringIds,
    isLoading,
    refresh,
  };
}