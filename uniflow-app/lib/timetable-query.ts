import { supabase } from "@/lib/supabase";
import { getAcademicContext } from "@/lib/academic";
import type { TimetableSlot } from "@/types";

export async function fetchTimetableSlots(params: {
  offeringIds?: string[];
  courseIds?: string[];
  lecturerId?: string;
}): Promise<TimetableSlot[]> {
  const { academic_session, semester } = getAcademicContext();

  let query = supabase
    .from("timetable")
    .select("*, profiles(full_name), courses(id, title, code, credit_units)")
    .eq("is_active", true)
    .eq("academic_session", academic_session)
    .eq("semester", semester)
    .order("day_of_week")
    .order("start_time");

  if (params.lecturerId) {
    query = query.eq("lecturer_id", params.lecturerId);
  } else if (params.offeringIds && params.offeringIds.length > 0) {
    query = query.in("course_offering_id", params.offeringIds);
  } else if (params.courseIds && params.courseIds.length > 0) {
    query = query.in("course_id", params.courseIds);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as TimetableSlot[];
}