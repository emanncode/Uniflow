import { DISPLAY_DAYS } from "@/lib/academic";

export interface TimetableDraftRow {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  courseLevel: number;
  semester: 1 | 2;
  lecturerId: string;
  lecturerEmail: string;
  lecturerName: string;
}

export interface TimetableDraftBuildResult {
  rows: TimetableDraftRow[];
  skippedNoLecturer: { code: string; title: string }[];
  skippedAlreadyScheduled: number;
}

export const TIMETABLE_CSV_HEADERS = [
  "course_code",
  "course_title",
  "lecturer_email",
  "venue",
  "day",
  "start_time",
  "end_time",
] as const;

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function draftRowKey(courseCode: string, lecturerEmail: string): string {
  return `${courseCode.toLowerCase()}::${lecturerEmail.toLowerCase()}`;
}

export function buildTimetableDraftRows(params: {
  courses: {
    id: string;
    title: string;
    code: string;
    level: number;
    semester: 1 | 2;
  }[];
  courseAssignments: Record<string, { id: string; full_name: string }[]>;
  lecturers: { id: string; full_name: string; email: string }[];
  scheduledKeys: Set<string>;
}): TimetableDraftBuildResult {
  const rows: TimetableDraftRow[] = [];
  const skippedNoLecturer: { code: string; title: string }[] = [];
  let skippedAlreadyScheduled = 0;

  for (const course of params.courses) {
    const assigned = params.courseAssignments[course.id] ?? [];
    if (assigned.length === 0) {
      skippedNoLecturer.push({ code: course.code, title: course.title });
      continue;
    }

    for (const assignment of assigned) {
      const lecturer = params.lecturers.find((l) => l.id === assignment.id);
      if (!lecturer) continue;

      const key = draftRowKey(course.code, lecturer.email);
      if (params.scheduledKeys.has(key)) {
        skippedAlreadyScheduled++;
        continue;
      }

      rows.push({
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        courseLevel: course.level,
        semester: course.semester,
        lecturerId: lecturer.id,
        lecturerEmail: lecturer.email,
        lecturerName: lecturer.full_name,
      });
    }
  }

  rows.sort((a, b) => {
    if (a.courseLevel !== b.courseLevel) return a.courseLevel - b.courseLevel;
    return a.courseCode.localeCompare(b.courseCode);
  });

  return { rows, skippedNoLecturer, skippedAlreadyScheduled };
}

export function timetableDraftToCsv(rows: TimetableDraftRow[]): string {
  const header = TIMETABLE_CSV_HEADERS.join(",");
  const body = rows
    .map((row) =>
      [
        row.courseCode,
        row.courseTitle,
        row.lecturerEmail,
        "",
        "",
        "",
        "",
      ]
        .map(csvCell)
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}\n`;
}

export function parseTimetableCsv(text: string): {
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

export function validateTimetableImportRow(row: Record<string, string>): string | null {
  if (!DISPLAY_DAYS.includes(row.day as (typeof DISPLAY_DAYS)[number])) {
    return `Invalid day "${row.day}" — use Monday–Friday`;
  }
  if (!row.start_time || !row.end_time) {
    return "Missing start_time or end_time";
  }
  if (row.start_time >= row.end_time) {
    return "end_time must be after start_time";
  }
  if (!row.venue?.trim()) {
    return "Missing venue";
  }
  return null;
}