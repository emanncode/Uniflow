export const DISPLAY_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export type DisplayDay = (typeof DISPLAY_DAYS)[number];

export function getCurrentAcademicSession(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 8) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}

export function displayDayToDb(day: string): string {
  return day.toLowerCase();
}

export function dbDayToDisplay(day: string | null | undefined): string {
  if (!day) return "Monday";
  const normalized = day.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}