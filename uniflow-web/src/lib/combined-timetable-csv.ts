import { DISPLAY_DAYS } from "@/lib/academic";

export const COMBINED_TIMETABLE_CSV_HEADERS = [
  "course_code",
  "course_title",
  "level",
  "semester",
  "credit_units",
  "lecturer_email",
  "day",
  "start_time",
  "end_time",
  "venue",
] as const;

export type CombinedTimetableCsvRow = {
  course_code: string;
  course_title: string;
  level: number;
  semester: 1 | 2;
  credit_units: number;
  lecturer_email: string;
  day: string;
  start_time: string;
  end_time: string;
  venue: string;
};

export function combinedOfferingKey(courseCode: string, lecturerEmail: string) {
  return `${courseCode.toLowerCase()}::${lecturerEmail.toLowerCase()}`;
}

export function parseCombinedTimetableCsv(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = lines[0]
    .toLowerCase()
    .split(",")
    .map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

export function normalizeCombinedRow(
  raw: Record<string, string>,
): CombinedTimetableCsvRow | null {
  const code = raw.course_code?.trim();
  const title = raw.course_title?.trim();
  const email = raw.lecturer_email?.trim().toLowerCase();
  const level = Number(raw.level);
  const semester = Number(raw.semester) as 1 | 2;
  const credit = Number(raw.credit_units) || 3;

  if (!code || !title || !email || !level || !(semester === 1 || semester === 2)) {
    return null;
  }

  return {
    course_code: code.toUpperCase(),
    course_title: title,
    level,
    semester,
    credit_units: credit,
    lecturer_email: email,
    day: raw.day?.trim() ?? "",
    start_time: raw.start_time?.trim() ?? "",
    end_time: raw.end_time?.trim() ?? "",
    venue: raw.venue?.trim() ?? "",
  };
}

export function validateCombinedScheduleRow(row: CombinedTimetableCsvRow): string | null {
  const hasSchedule = Boolean(row.day || row.start_time || row.end_time || row.venue);
  if (!hasSchedule) return null;

  if (!DISPLAY_DAYS.includes(row.day as (typeof DISPLAY_DAYS)[number])) {
    return `Invalid day "${row.day}" — use Monday–Friday`;
  }
  if (!row.start_time || !row.end_time) {
    return "Missing start_time or end_time";
  }
  if (row.start_time >= row.end_time) {
    return "end_time must be after start_time";
  }
  if (!row.venue) {
    return "Missing venue";
  }
  return null;
}

export function combinedCsvTemplate(): string {
  return `${COMBINED_TIMETABLE_CSV_HEADERS.join(",")}
CSC301,Data Structures,300,1,3,lecturer@uni.edu,Monday,08:00,10:00,LT1
CSC301,Data Structures,300,1,3,lecturer@uni.edu,Wednesday,14:00,16:00,Lab2
MTH201,Linear Algebra,200,1,3,prof@uni.edu,,,,
`;
}