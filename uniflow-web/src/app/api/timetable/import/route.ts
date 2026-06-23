import { createAdminClient } from "@/lib/supabase-admin";
import { canManageUniversity } from "@/lib/auth";
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

type PreviewRow = {
  line: number;
  course_code: string;
  lecturer_email: string;
  has_schedule: boolean;
  status: "ok" | "error" | "warning";
  message?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      university_id,
      department_id,
      csv_text,
      mode = "preview",
      academic_session: sessionOverride,
      semester: semesterOverride,
      auto_enroll = true,
    } = body as {
      university_id?: string;
      department_id?: string;
      csv_text?: string;
      mode?: "preview" | "commit";
      academic_session?: string;
      semester?: 1 | 2;
      auto_enroll?: boolean;
    };

    if (!university_id || !department_id || !csv_text?.trim()) {
      return NextResponse.json(
        { error: "university_id, department_id, and csv_text are required" },
        { status: 400 },
      );
    }

    if (!(await canManageUniversity(university_id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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

    const parsedRows: {
      line: number;
      row: NonNullable<ReturnType<typeof normalizeCombinedRow>>;
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

      const lecturer = lecturerByEmail.get(emailCheck.normalized);
      if (!lecturer) {
        errorCount += 1;
        preview.push({
          line,
          course_code: normalized.course_code,
          lecturer_email: normalized.lecturer_email,
          has_schedule: Boolean(normalized.day),
          status: "error",
          message: "Lecturer not found in this department",
        });
        continue;
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

      parsedRows.push({ line, row: normalized });
    }

    if (mode === "preview" || errorCount > 0) {
      return NextResponse.json({
        preview: true,
        ok_count: okCount,
        error_count: errorCount,
        rows: preview,
        can_commit: errorCount === 0 && okCount > 0,
      });
    }

    let coursesUpserted = 0;
    let offeringsUpserted = 0;
    let slotsUpserted = 0;

    for (const { row } of parsedRows) {
      const lecturer = lecturerByEmail.get(row.lecturer_email)!;

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

      const offeringId = await upsertCourseOffering(supabase, {
        course_id: courseId,
        lecturer_id: lecturer.id,
        department_id,
        university_id,
        academic_session,
        semester: row.semester,
      });
      offeringsUpserted += 1;

      await syncLegacyLecturerCourse(supabase, {
        course_id: courseId,
        lecturer_id: lecturer.id,
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
        lecturer_id: lecturer.id,
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
      auto_enroll: enrollResult,
      academic_session,
      semester,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}