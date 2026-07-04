import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getAcademicContext } from "@/lib/academic";
import { useAuthStore } from "@/store/useAuthStore";
import { queryKeys } from "@/lib/queryClient";

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

async function loadFromTimetable(
  lecturerId: string,
): Promise<LecturerTeachingContext> {
  const { academic_session, semester } = getAcademicContext();

  const { data, error } = await supabase
    .from("timetable")
    .select("course_id, course_offering_id")
    .eq("lecturer_id", lecturerId)
    .eq("is_active", true)
    .eq("academic_session", academic_session)
    .eq("semester", semester);

  console.log('[loadFromTimetable] raw data length:', (data ?? []).length, 'for lecturer', lecturerId, 'session:', academic_session, semester);

  if (error) throw error;

  if ((data ?? []).length === 0) {
    const { data: allTt } = await supabase
      .from("timetable")
      .select("course_id, academic_session, semester, course_offering_id")
      .eq("lecturer_id", lecturerId)
      .eq("is_active", true);
    console.log('[loadFromTimetable] NO TIMETABLE FOR SESSION. All active timetable for lecturer:', allTt);
  }

  const courseIds = [...new Set((data ?? []).map((r) => r.course_id).filter(Boolean))];
  const offeringIds = [...new Set(
    (data ?? []).map((r) => r.course_offering_id).filter((id): id is string => Boolean(id))
  )];

  return { courseIds, offeringIds };
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
      if (next.courseIds.length === 0) {
        next = await loadFromTimetable(lecturerId);
      }
    } catch {
      // Try legacy then timetable as last resort
      try {
        next = await loadFromLegacy(lecturerId);
      } catch {
        next = await loadFromTimetable(lecturerId);
      }
    }

    if (next.courseIds.length === 0) {
      // Last-ditch: any timetable for this lecturer (ignore session)
      const { data: anyTt } = await supabase
        .from("timetable")
        .select("course_id, course_offering_id")
        .eq("lecturer_id", lecturerId)
        .eq("is_active", true);
      next = {
        courseIds: [...new Set((anyTt ?? []).map((r: any) => r.course_id).filter(Boolean))],
        offeringIds: [...new Set((anyTt ?? []).map((r: any) => r.course_offering_id).filter(Boolean))],
      };
      if (next.courseIds.length > 0) {
        console.warn('[fetchLecturerTeachingContext] Using any-session timetable fallback for course list');
      }
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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.lecturerContext(lecturerId),
    queryFn: () => fetchLecturerTeachingContext(lecturerId!, true),
    enabled: !!lecturerId,
    staleTime: 1000 * 45,
  });

  const refresh = useCallback(
    async (force = true) => {
      if (!lecturerId) return { courseIds: [], offeringIds: [] };
      if (force) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.lecturerContext(lecturerId) });
      }
      const result = await query.refetch();
      const next = result.data ?? { courseIds: [], offeringIds: [] };
      console.log('[useLecturerCourseIds] refreshed via RQ:', next, 'for lecturer', lecturerId);
      return next;
    },
    [lecturerId, queryClient, query],
  );

  const context = query.data ?? { courseIds: [], offeringIds: [] };

  return {
    courseIds: context.courseIds,
    offeringIds: context.offeringIds,
    isLoading: query.isLoading || query.isFetching,
    refresh,
  };
}