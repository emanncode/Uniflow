import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getAcademicContext } from "@/lib/academic";
import { useAuthStore } from "@/store/useAuthStore";
import { queryKeys } from "@/lib/queryClient";

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

    let { data, error } = await supabase
      .from("enrollments")
      .select("course_id, course_offering_id")
      .eq("student_id", studentId)
      .eq("is_active", true)
      .eq("academic_session", academic_session)
      .eq("semester", semester);

    console.log('[fetchStudentEnrollmentContext] raw enrollments length:', (data ?? []).length, 'for student', studentId, 'session:', academic_session, semester);

    if (error) throw error;

    let usedFallback = false;

    // Debug + fallback: if no enrollments for current session/semester, try broader
    // (helps when enrollments were created for the other semester in the same academic year)
    if ((data ?? []).length === 0) {
      // Try same session but any semester first (most common mismatch)
      let { data: fallbackEnr } = await supabase
        .from("enrollments")
        .select("course_id, course_offering_id, academic_session, semester, is_active")
        .eq("student_id", studentId)
        .eq("is_active", true)
        .eq("academic_session", academic_session);

      if ((fallbackEnr ?? []).length === 0) {
        // Last resort: any enrollments
        const { data: allEnr } = await supabase
          .from("enrollments")
          .select("course_id, course_offering_id, academic_session, semester, is_active")
          .eq("student_id", studentId)
          .eq("is_active", true);
        fallbackEnr = allEnr;
      }

      console.log('[fetchStudentEnrollmentContext] NO ENROLLMENTS FOR CURRENT SESSION. Fallback enrollments:', fallbackEnr);

      if (fallbackEnr && fallbackEnr.length > 0) {
        console.warn(
          '[fetchStudentEnrollmentContext] 0 enrollments for current session/semester',
          { academic_session, semester },
          '— falling back to', fallbackEnr.length, 'enrollments (relaxed semester)'
        );
        data = fallbackEnr;
        usedFallback = true;
      }
    }

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

    if (usedFallback && courseIds.length > 0) {
      console.warn('[fetchStudentEnrollmentContext] using fallback enrollments for context (different semester data may be shown)');
    }

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
  const studentId = profile?.role === "student" ? profile.id : undefined;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.studentEnrollments(studentId),
    queryFn: () => fetchStudentEnrollmentContext(studentId!, true),
    enabled: !!studentId,
    staleTime: 1000 * 45,
  });

  const refresh = useCallback(
    async (force = true) => {
      if (!studentId) return { courseIds: [], offeringIds: [] };
      if (force) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.studentEnrollments(studentId) });
      }
      // Trigger a refetch and return latest
      const result = await query.refetch();
      const next = result.data ?? { courseIds: [], offeringIds: [] };
      console.log('[useStudentEnrollments] refreshed via RQ:', next, 'for student', studentId);
      return next;
    },
    [studentId, queryClient, query],
  );

  // Back-compat: still expose context shape
  const context = query.data ?? { courseIds: [], offeringIds: [] };

  return {
    courseIds: context.courseIds,
    offeringIds: context.offeringIds,
    isLoading: query.isLoading || query.isFetching,
    refresh,
  };
}