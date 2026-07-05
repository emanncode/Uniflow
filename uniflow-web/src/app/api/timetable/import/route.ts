import { createAdminClient } from "@/lib/supabase-admin";
import {
  getAcademicContext,
  displayDayToDb,
} from "@/lib/academic";
import {
  normalizeCombinedRow,
  parseCombinedTimetableCsv,
  validateCombinedScheduleRow,
} from "@/lib/combined-timetable-csv";
import {
  findOrCreateCourse,
  syncLegacyLecturerCourse,
  upsertCourseOffering,
} from "@/lib/course-offerings-server";
import { autoEnrollDepartment } from "@/lib/enrollments-server";
import { validateAndNormalizeEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import { safeErrorResponse } from "@/lib/utils";
import { requireUniversityAdmin } from "@/lib/api-auth";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const timetableImportSchema = z.object({
  university_id: z.string().min(1),
  department_id: z.string().min(1),
  csv_text: z.string().min(1).max(500 * 1024), // 500KB max
  mode: z.enum(["preview", "commit"]).optional().default("preview"),
  academic_session: z.string().optional(),
  semester: z.union([z.literal(1), z.literal(2)]).optional(),
  auto_enroll: z.boolean().optional().default(true),
});

type PreviewRow = {
  line: number;
  course_code: string;
  lecturer_email: string;
  has_schedule: boolean;
  status: "ok" | "error" | "warning";
  message?: string;
};

type SkippedLecturer = {
  line: number;
  course_code: string;
  course_title: string;
  lecturer_email: string;
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = timetableImportSchema.parse(rawBody);

    const {
      university_id,
      department_id,
      csv_text,
      mode,
      academic_session: sessionOverride,
      semester: semesterOverride,
      auto_enroll,
    } = parsed;

    const authError = await requireUniversityAdmin(university_id);
    if (authError) return authError;

    const ip = await getClientIp();
    const rateError = await rateLimit(`timetable-import:${university_id}:${ip}`, 3, 60_000);
    if (rateError) return rateError;

    const ctx = getAcademicContext();
    const academic_session = sessionOverride ?? ctx.academic_session;
    const semester = semesterOverride ?? ctx.semester;

    const supabase = createAdminClient();

    const { data: lecturers, error: lecturerError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("university_id", university_id)
      .eq("department_id", department_id)
      .in("role", ["lecturer", "dean", "hod"])
      .eq("is_active", true);

    if (lecturerError) {
      return NextResponse.json({ error: lecturerError.message }, { status: 500 });
    }

    const lecturerByEmail = new Map<string, { id: string; full_name: string }>();
    for (const l of lecturers ?? []) {
      if (l.email) lecturerByEmail.set(l.email.toLowerCase(), l);
    }

    const { rows: rawRows } = parseCombinedTimetableCsv(csv_text);
    const preview: PreviewRow[] = [];
    let okCount = 0;
    let errorCount = 0;
    let warningCount = 0;

    const parsedRows: {
      line: number;
      row: NonNullable<ReturnType<typeof normalizeCombinedRow>>;
      lecturerId: string | null;
    }[] = [];

    for (let i = 0; i < rawRows.length; i += 1) {
      const line = i + 2;
      const normalized = normalizeCombinedRow(rawRows[i]);

      if (!normalized) {
        errorCount += 1;
        preview.push({
          line,
          course_code: rawRows[i].course_code ?? "—",
          lecturer_email: rawRows[i].lecturer_email ?? "—",
          has_schedule: false,
          status: "error",
          message:
            "Missing or invalid course_code, course_title, level, semester, or lecturer_email",
        });
        continue;
      }

      let lecturerId: string | null = null;
      let lecturerEmail = "";

      if (normalized.lecturer_email) {
        const emailCheck = validateAndNormalizeEmail(normalized.lecturer_email);
        if (!emailCheck.valid) {
          errorCount += 1;
          preview.push({
            line,
            course_code: normalized.course_code,
            lecturer_email: normalized.lecturer_email,
            has_schedule: Boolean(normalized.day),
            status: "error",
            message: emailCheck.error ?? "Invalid lecturer email",
          });
          continue;
        }
        lecturerEmail = emailCheck.normalized;
        const lecturer = lecturerByEmail.get(lecturerEmail);
        if (lecturer) {
          lecturerId = lecturer.id;
        }
      }

      const scheduleError = validateCombinedScheduleRow(normalized);
      if (scheduleError) {
        errorCount += 1;
        preview.push({
          line,
          course_code: normalized.course_code,
          lecturer_email: normalized.lecturer_email,
          has_schedule: true,
          status: "error",
          message: scheduleError,
        });
        continue;
      }

      const hasSchedule = Boolean(
        normalized.day && normalized.start_time && normalized.end_time && normalized.venue,
      );

      if (!lecturerId && normalized.lecturer_email) {
        warningCount += 1;
        preview.push({
          line,
          course_code: normalized.course_code,
          lecturer_email: normalized.lecturer_email,
          has_schedule: hasSchedule,
          status: "warning",
          message: "Lecturer not found — course will be created without lecturer assignment",
        });
        parsedRows.push({ line, row: normalized, lecturerId: null });
        continue;
      }

      if (!lecturerId && !normalized.lecturer_email) {
        warningCount += 1;
        preview.push({
          line,
          course_code: normalized.course_code,
          lecturer_email: "",
          has_schedule: false,
          status: "warning",
          message: "No lecturer email — course created without lecturer assignment",
        });
        parsedRows.push({ line, row: normalized, lecturerId: null });
        continue;
      }

      okCount += 1;
      preview.push({
        line,
        course_code: normalized.course_code,
        lecturer_email: normalized.lecturer_email,
        has_schedule: hasSchedule,
        status: hasSchedule ? "ok" : "warning",
        message: hasSchedule
          ? undefined
          : "Course + offering only (no schedule on this row)",
      });

      parsedRows.push({ line, row: normalized, lecturerId });
    }

    if (mode === "preview" || errorCount > 0) {
      return NextResponse.json({
        preview: true,
        ok_count: okCount,
        warning_count: warningCount,
        error_count: errorCount,
        rows: preview,
        can_commit: errorCount === 0 && (okCount > 0 || warningCount > 0),
      });
    }

    let coursesUpserted = 0;
    let offeringsUpserted = 0;
    let slotsUpserted = 0;
    const skippedLecturers: SkippedLecturer[] = [];

    for (const { line, row, lecturerId } of parsedRows) {
      const courseId = await findOrCreateCourse(supabase, {
        university_id,
        department_id,
        code: row.course_code,
        title: row.course_title,
        level: row.level,
        semester: row.semester,
        credit_units: row.credit_units,
      });
      coursesUpserted += 1;

      if (!lecturerId) {
        if (row.lecturer_email) {
          skippedLecturers.push({
            line,
            course_code: row.course_code,
            course_title: row.course_title,
            lecturer_email: row.lecturer_email,
          });
        }
        continue;
      }

      const offeringId = await upsertCourseOffering(supabase, {
        course_id: courseId,
        lecturer_id: lecturerId,
        department_id,
        university_id,
        academic_session,
        semester: row.semester,
      });
      offeringsUpserted += 1;

      await syncLegacyLecturerCourse(supabase, {
        course_id: courseId,
        lecturer_id: lecturerId,
        university_id,
        academic_session,
        semester: row.semester,
      });

      const hasSchedule =
        row.day && row.start_time && row.end_time && row.venue;
      if (!hasSchedule) continue;

      const { data: existingSlot } = await supabase
        .from("timetable")
        .select("id")
        .eq("course_offering_id", offeringId)
        .eq("day_of_week", displayDayToDb(row.day))
        .eq("start_time", row.start_time)
        .eq("end_time", row.end_time)
        .eq("venue", row.venue)
        .maybeSingle();

      if (existingSlot) {
        await supabase
          .from("timetable")
          .update({ is_active: true })
          .eq("id", existingSlot.id);
        slotsUpserted += 1;
        continue;
      }

      const { error: slotError } = await supabase.from("timetable").insert({
        course_id: courseId,
        lecturer_id: lecturerId,
        course_offering_id: offeringId,
        department_id,
        university_id,
        day_of_week: displayDayToDb(row.day),
        start_time: row.start_time,
        end_time: row.end_time,
        venue: row.venue,
        academic_session,
        semester: row.semester,
        is_active: true,
      });

      if (!slotError) slotsUpserted += 1;
    }

    let enrollResult = null;
    if (auto_enroll) {
      enrollResult = await autoEnrollDepartment(supabase, {
        university_id,
        department_id,
        academic_session,
        semester,
      });
    }

    return NextResponse.json({
      success: true,
      courses_upserted: coursesUpserted,
      offerings_upserted: offeringsUpserted,
      slots_upserted: slotsUpserted,
      skipped_lecturers: skippedLecturers,
      auto_enroll: enrollResult,
      academic_session,
      semester,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: err.issues }, { status: 400 });
    }
    const safe = safeErrorResponse(err, "Import failed");
    return NextResponse.json(safe, { status: 500 });
  }
}