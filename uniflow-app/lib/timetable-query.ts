import { supabase } from "@/lib/supabase";
import { getAcademicContext } from "@/lib/academic";
import type { TimetableSlot } from "@/types";

export async function fetchTimetableSlots(params: {
  offeringIds?: string[];
  courseIds?: string[];
  lecturerId?: string;
}): Promise<TimetableSlot[]> {
  const { academic_session, semester } = getAcademicContext();

  // Build a query using the most reliable identifiers first.
  // timetable rows are guaranteed to have lecturer_id + course_id.
  // course_offering_id may be null for manually-created or legacy slots.
  let query = supabase
    .from("timetable")
    .select("*, profiles:lecturer_id(full_name), courses(id, title, code, credit_units)")
    .eq("is_active", true)
    .eq("academic_session", academic_session)
    .eq("semester", semester)
    .order("day_of_week")
    .order("start_time");

  if (params.lecturerId) {
    // Lecturers: always reliable via their own id (matches RLS too)
    query = query.eq("lecturer_id", params.lecturerId);
  } else if (params.courseIds && params.courseIds.length > 0) {
    // Students (and course pages): course_id is always populated
    query = query.in("course_id", params.courseIds);
  } else if (params.offeringIds && params.offeringIds.length > 0) {
    query = query.in("course_offering_id", params.offeringIds);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) throw error;
  console.log('[fetchTimetableSlots] returned', (data ?? []).length, 'slots for params:', params);

  let result = (data ?? []) as TimetableSlot[];

  // If we got nothing for the current academic context, try a broader query
  // (helps when imported/created data has different session strings or semester)
  // and log for visibility.
  if (result.length === 0) {
    // Fallback: keep the session filter (important for year) but relax semester
    // (common during dev when data was created for the other semester in the session)
    let fallbackQuery = supabase
      .from("timetable")
      .select("*, profiles:lecturer_id(full_name), courses(id, title, code, credit_units)")
      .eq("is_active", true)
      .eq("academic_session", academic_session)
      .order("day_of_week")
      .order("start_time");

    if (params.lecturerId) {
      fallbackQuery = fallbackQuery.eq("lecturer_id", params.lecturerId);
    } else if (params.courseIds && params.courseIds.length > 0) {
      fallbackQuery = fallbackQuery.in("course_id", params.courseIds);
    } else if (params.offeringIds && params.offeringIds.length > 0) {
      fallbackQuery = fallbackQuery.in("course_offering_id", params.offeringIds);
    }

    const { data: fallbackData } = await fallbackQuery;
    const fallback = (fallbackData ?? []) as TimetableSlot[];

    if (fallback.length > 0) {
      console.warn(
        '[fetchTimetableSlots] 0 results for current session/semester',
        { academic_session, semester },
        '— falling back to', fallback.length, 'slots (relaxed semester filter)'
      );
      result = fallback;
    }

    // Original debug for lecturers
    if (params.lecturerId) {
      const { data: allTimetable } = await supabase
        .from("timetable")
        .select("id, academic_session, semester, is_active, lecturer_id, course_offering_id")
        .eq("lecturer_id", params.lecturerId)
        .eq("is_active", true);
      console.log('[fetchTimetableSlots] DEBUG all active timetable for lecturer (any session):', allTimetable);
    }
  }

  return result;
}