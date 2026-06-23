export const DISPLAY_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export type DisplayDay = (typeof DISPLAY_DAYS)[number];

/** Current Mon–Fri tab; weekends default to Monday. */
export function getDefaultDisplayDay(date = new Date()): DisplayDay {
  const map: Partial<Record<number, DisplayDay>> = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
  };
  return map[date.getDay()] ?? "Monday";
}

export function getCurrentAcademicSession(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 8) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}

/** First sem: Aug–Jan; second sem: Feb–Jul (Nigerian academic calendar default). */
export function getCurrentSemester(date = new Date()): 1 | 2 {
  const month = date.getMonth();
  if (month === 0 || month >= 7) return 1;
  return 2;
}

export function getAcademicContext(date = new Date()) {
  return {
    academic_session: getCurrentAcademicSession(date),
    semester: getCurrentSemester(date),
  };
}

export function displayDayToDb(day: string): string {
  return day.toLowerCase();
}

export function dbDayToDisplay(day: string | null | undefined): string {
  if (!day) return "Monday";
  const normalized = day.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}