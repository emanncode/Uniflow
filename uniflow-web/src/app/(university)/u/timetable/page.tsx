"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  DISPLAY_DAYS,
  dbDayToDisplay,
  displayDayToDb,
  getCurrentAcademicSession,
} from "@/lib/academic";
import { upsertLecturerCourseAssignment } from "@/lib/lecturer-courses";
import {
  type CourseLevel,
  type MaxCourseLevel,
  getCourseLevels,
} from "@/lib/course-levels";
import LevelTabs from "@/components/ui/LevelTabs";
import {
  CalendarDays,
  Plus,
  X,
  Loader2,
  Trash2,
  AlertCircle,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  ChevronDown,
  Search,
  ArrowLeft
} from "lucide-react";
import { validateAndNormalizeEmail } from "@/lib/email";

interface TimetableSlot {
  id: string;
  course_name: string;
  course_code: string;
  course_level: number;
  lecturer_name: string;
  venue: string;
  day: string;
  start_time: string;
  end_time: string;
  department_id: string | null;
  department_name: string;
  conflict?: boolean;
}

interface Course {
  id: string;
  title: string;
  code: string;
  level: number;
  semester: 1 | 2;
}
interface Lecturer {
  id: string;
  full_name: string;
  email: string;
}
interface Department {
  id: string;
  name: string;
  short_name: string;
  faculty: string;
  max_course_level: MaxCourseLevel | null;
}

interface TimetableRow {
  id: string;
  venue: string;
  day_of_week: string | null;
  day: string | null;
  start_time: string;
  end_time: string;
  course_id: string;
  lecturer_id: string;
  department_id: string | null;
}

function mapTimetableRow(
  t: TimetableRow,
  departmentName: string,
  courses: Course[],
  lecturers: Lecturer[],
): TimetableSlot {
  const course = courses.find((c) => c.id === t.course_id);
  const lecturer = lecturers.find((l) => l.id === t.lecturer_id);
  return {
    id: t.id,
    course_name: course?.title ?? "—",
    course_code: course?.code ?? "—",
    course_level: course?.level ?? 100,
    lecturer_name: lecturer?.full_name ?? "—",
    venue: t.venue,
    day: dbDayToDisplay(t.day_of_week ?? t.day),
    start_time: t.start_time,
    end_time: t.end_time,
    department_id: t.department_id,
    department_name: departmentName,
  };
}
const DAYS = [...DISPLAY_DAYS];
const HOURS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const DAY_COLORS: Record<string, string> = {
  Monday: "var(--info)",
  Tuesday: "var(--brand)",
  Wednesday: "var(--warning)",
  Thursday: "var(--success)",
  Friday: "var(--danger)",
};

const DAY_MUTED_COLORS: Record<string, string> = {
  Monday: "var(--info-muted)",
  Tuesday: "var(--brand-muted)",
  Wednesday: "var(--warning-muted)",
  Thursday: "var(--success-muted)",
  Friday: "var(--danger-muted)",
};

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-lg)",
          padding: "28px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-premium)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function detectConflicts(slots: TimetableSlot[]): TimetableSlot[] {
  return slots.map((slot) => {
    const conflict = slots.some((other) => {
      if (other.id === slot.id) return false;
      if (other.day !== slot.day) return false;
      const overlaps =
        slot.start_time < other.end_time && slot.end_time > other.start_time;
      if (!overlaps) return false;
      return (
        other.venue === slot.venue || other.lecturer_name === slot.lecturer_name
      );
    });
    return { ...slot, conflict };
  });
}

function SlotCard({
  slot,
  onDelete,
}: {
  slot: TimetableSlot;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        background: slot.conflict ? "var(--danger-muted)" : "var(--bg-card)",
        border: `1px solid ${slot.conflict ? "rgba(239,68,68,0.2)" : "var(--border-primary)"}`,
        borderRadius: "var(--radius-sm)",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "all var(--transition)",
      }}
      onMouseEnter={(e) => {
        if (!slot.conflict) {
          (e.currentTarget as HTMLElement).style.borderColor =
            "var(--border-secondary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!slot.conflict) {
          (e.currentTarget as HTMLElement).style.borderColor =
            "var(--border-primary)";
        }
      }}
    >
      {slot.conflict && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: "4px",
            padding: "2px 6px",
            alignSelf: "flex-start",
          }}
        >
          <AlertTriangle size={11} style={{ color: "var(--danger)" }} />
          <span
            style={{
              fontSize: "9px",
              fontWeight: 600,
              color: "var(--danger)",
              textTransform: "uppercase",
            }}
          >
            CONFLICT
          </span>
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            {slot.course_name}
          </p>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "4px",
              padding: "1px 5px",
              display: "inline-block",
              marginTop: "4px",
              fontFamily: "monospace",
            }}
          >
            {slot.course_code}
          </span>
        </div>
        <button
          onClick={() => onDelete(slot.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            flexShrink: 0,
          }}
        >
          <Trash2 size={13} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock
            size={11}
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
          />
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            {slot.start_time} – {slot.end_time}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <MapPin
            size={11}
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
          />
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            {slot.venue}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Users
            size={11}
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
          />
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            {slot.lecturer_name}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeDay, setActiveDay] = useState("Monday");
  const [activeLevel, setActiveLevel] = useState<CourseLevel>(100);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(0);
  const [importCorrected, setImportCorrected] = useState(0);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [uniId, setUniId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [courseAssignments, setCourseAssignments] = useState<
    Record<string, string[]>
  >({});
  const [academicSession, setAcademicSession] = useState(
    getCurrentAcademicSession(),
  );

  const [newCourseId, setNewCourseId] = useState("");
  const [newLecturerId, setNewLecturerId] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newDay, setNewDay] = useState("Monday");
  const [newStart, setNewStart] = useState("08:00");
  const [newEnd, setNewEnd] = useState("10:00");

  const router = useRouter();
  const searchParams = useSearchParams();
  const deptParam = searchParams.get("department");

  const activeDept = useMemo(() => {
    if (!deptParam || departments.length === 0) return null;
    return (
      departments.find(
        (d) => d.id === deptParam || d.short_name === deptParam,
      ) ?? null
    );
  }, [deptParam, departments]);

  const maxCourseLevel = (activeDept?.max_course_level ?? 400) as MaxCourseLevel;

  const levelTabs = useMemo(
    () => getCourseLevels(maxCourseLevel),
    [maxCourseLevel],
  );

  const levelCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const level of levelTabs) counts[level] = 0;
    for (const slot of slots) {
      if (counts[slot.course_level] !== undefined) {
        counts[slot.course_level]++;
      }
    }
    return counts;
  }, [slots, levelTabs]);

  const levelCourses = useMemo(
    () => courses.filter((c) => c.level === activeLevel),
    [courses, activeLevel],
  );

  const selectedCourse = useMemo(
    () => levelCourses.find((c) => c.id === newCourseId) ?? null,
    [levelCourses, newCourseId],
  );

  useEffect(() => {
    if (!levelTabs.includes(activeLevel)) {
      setActiveLevel((levelTabs[0] ?? 100) as CourseLevel);
    }
  }, [levelTabs, activeLevel]);

  useEffect(() => {
    setNewCourseId("");
    setNewLecturerId("");
  }, [activeLevel]);

  const modalLecturers = useMemo(() => {
    if (!newCourseId) return lecturers;
    const assigned = courseAssignments[newCourseId] ?? [];
    if (assigned.length === 0) return lecturers;
    const assignedSet = new Set(assigned);
    const preferred = lecturers.filter((l) => assignedSet.has(l.id));
    const others = lecturers.filter((l) => !assignedSet.has(l.id));
    return [...preferred, ...others];
  }, [lecturers, newCourseId, courseAssignments]);

  const conflictCheck = useMemo(() => {
    if (!newVenue || !newDay || !newStart || !newEnd || !newLecturerId) {
      return null;
    }
    const clash = slots.find((s) => {
      if (s.day !== newDay) return false;
      const overlaps = newStart < s.end_time && newEnd > s.start_time;
      if (!overlaps) return false;
      return (
        s.venue === newVenue ||
        s.lecturer_name ===
          lecturers.find((l) => l.id === newLecturerId)?.full_name
      );
    });
    return clash
      ? `⚠️ Conflict with "${clash.course_name}" at ${clash.start_time}–${clash.end_time} ${clash.venue === newVenue ? `(same venue: ${newVenue})` : "(same lecturer)"}`
      : null;
  }, [newVenue, newDay, newStart, newEnd, newLecturerId, slots, lecturers]);

  useEffect(() => {
    if (departments.length === 0) return;
    if (!deptParam || !activeDept) {
      router.replace("/u/faculties");
    }
  }, [departments, deptParam, activeDept, router]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPageData() {
      setFetchError("");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("university_id")
        .eq("id", session.user.id)
        .single();
      if (!profile || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setUniId(profile.university_id);

      const { data: deptRes } = await supabase
        .from("departments")
        .select("id, name, short_name, faculty, max_course_level")
        .eq("university_id", profile.university_id)
        .order("name");

      if (cancelled) return;
      setDepartments(deptRes ?? []);

      const departmentId =
        deptRes?.find(
          (d) => d.id === deptParam || d.short_name === deptParam,
        )?.id ?? null;

      if (!departmentId) {
        if (!cancelled) setLoading(false);
        return;
      }

      const sessionYear = getCurrentAcademicSession();
      const departmentName =
        deptRes?.find((d) => d.id === departmentId)?.name ?? "—";

      const [ttRes, courseRes, lecRes] = await Promise.all([
        supabase
          .from("timetable")
          .select(
            "id, venue, day_of_week, day, start_time, end_time, course_id, lecturer_id, department_id",
          )
          .eq("university_id", profile.university_id)
          .eq("department_id", departmentId)
          .order("day_of_week")
          .order("start_time"),
        supabase
          .from("courses")
          .select("id, title, code, level, semester")
          .eq("university_id", profile.university_id)
          .eq("department_id", departmentId)
          .eq("is_active", true)
          .order("title"),
        supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("university_id", profile.university_id)
          .in("role", ["lecturer", "dean", "hod"])
          .order("full_name"),
      ]);

      if (cancelled) return;

      const errors = [ttRes.error, courseRes.error, lecRes.error]
        .filter(Boolean)
        .map((e) => e!.message);
      if (errors.length > 0) {
        setFetchError(errors.join(" · "));
      }

      const loadedCourses: Course[] = (courseRes.data ?? []).map((c) => ({
        ...c,
        level: c.level,
        semester: c.semester as 1 | 2,
      }));
      const loadedLecturers: Lecturer[] = lecRes.data ?? [];

      const rawSlots = (ttRes.data ?? []).map((t) =>
        mapTimetableRow(
          t as unknown as TimetableRow,
          departmentName,
          loadedCourses,
          loadedLecturers,
        ),
      );
      setSlots(detectConflicts(rawSlots));
      setCourses(loadedCourses);
      setLecturers(loadedLecturers);
      setAcademicSession(sessionYear);

      const courseIds = (courseRes.data ?? []).map((c) => c.id);
      if (courseIds.length > 0) {
        const { data: assignments } = await supabase
          .from("lecturer_courses")
          .select("course_id, lecturer_id")
          .in("course_id", courseIds)
          .eq("academic_session", sessionYear)
          .eq("is_active", true);

        const map: Record<string, string[]> = {};
        for (const row of assignments ?? []) {
          if (!map[row.course_id]) map[row.course_id] = [];
          map[row.course_id].push(row.lecturer_id);
        }
        if (!cancelled) setCourseAssignments(map);
      } else if (!cancelled) {
        setCourseAssignments({});
      }

      setLoading(false);
    }

    void fetchPageData();

    return () => {
      cancelled = true;
    };
  }, [deptParam, refreshKey]);

  function loadData() {
    setRefreshKey((k) => k + 1);
  }

  const CSV_TEMPLATE = `course_code,lecturer_email,venue,day,start_time,end_time\nCSC301,lecturer@email.com,LT1,Monday,08:00,10:00\nMTH201,john@email.com,Hall A,Tuesday,10:00,12:00`;

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeDept) return;
    setImporting(true);
    setImportErrors([]);
    setImportSuccess(0);
    setImportCorrected(0);

    const text = await file.text();
    const lines = text
      .trim()
      .split("\n")
      .filter((l) => l.trim());
    const headers = lines[0]
      .toLowerCase()
      .split(",")
      .map((h) => h.trim());
    const rows = lines.slice(1);

    const errors: string[] = [];
    let successCount = 0;
    let correctedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const vals = rows[i].split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = vals[idx] ?? "";
      });
      const lineNum = i + 2;

      const course = courses.find(
        (c) => c.code.toLowerCase() === row.course_code?.toLowerCase(),
      );
      if (!course) {
        errors.push(`Row ${lineNum}: Course "${row.course_code}" not found`);
        continue;
      }

      const emailCheck = validateAndNormalizeEmail(row.lecturer_email || "");
      if (!emailCheck.valid) {
        errors.push(`Row ${lineNum}: Invalid lecturer email "${row.lecturer_email}"`);
        continue;
      }
      if (emailCheck.wasCorrected) {
        correctedCount++;
      }

      const { data: lecProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", emailCheck.normalized)
        .eq("university_id", uniId)
        .single();
      if (!lecProfile) {
        errors.push(
          `Row ${lineNum}: Lecturer "${emailCheck.normalized}" not found`,
        );
        continue;
      }

      if (!DAYS.includes(row.day as (typeof DAYS)[number])) {
        errors.push(
          `Row ${lineNum}: Invalid day "${row.day}" — must be Monday/Tuesday/Wednesday/Thursday/Friday`,
        );
        continue;
      }
      if (!row.start_time || !row.end_time) {
        errors.push(`Row ${lineNum}: Missing start_time or end_time`);
        continue;
      }
      if (row.start_time >= row.end_time) {
        errors.push(`Row ${lineNum}: end_time must be after start_time`);
        continue;
      }
      if (!row.venue) {
        errors.push(`Row ${lineNum}: Missing venue`);
        continue;
      }

      const { error: insErr } = await supabase.from("timetable").insert({
        course_id: course.id,
        lecturer_id: lecProfile.id,
        department_id: activeDept.id,
        venue: row.venue,
        day_of_week: displayDayToDb(row.day),
        start_time: row.start_time,
        end_time: row.end_time,
        university_id: uniId,
        academic_session: academicSession,
        semester: course.semester,
        is_active: true,
      });

      if (insErr) {
        errors.push(`Row ${lineNum}: ${insErr.message}`);
        continue;
      }

      try {
        await upsertLecturerCourseAssignment({
          lecturerId: lecProfile.id,
          courseId: course.id,
          universityId: uniId!,
          semester: course.semester,
          academicSession,
        });
      } catch {
        // Slot saved; assignment sync is best-effort during import
      }

      successCount++;
    }

    setImportErrors(errors);
    setImportSuccess(successCount);
    setImportCorrected(correctedCount);
    if (successCount > 0) loadData();
    setImporting(false);
    e.target.value = "";
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!activeDept) return;
    if (conflictCheck) {
      setError("Resolve conflicts before saving.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (newStart >= newEnd)
        throw new Error("End time must be after start time.");
      const course = courses.find((c) => c.id === newCourseId);
      if (!course) throw new Error("Selected course not found.");

      const { error: err } = await supabase.from("timetable").insert({
        course_id: newCourseId,
        lecturer_id: newLecturerId,
        department_id: activeDept.id,
        venue: newVenue.trim(),
        day_of_week: displayDayToDb(newDay),
        start_time: newStart,
        end_time: newEnd,
        university_id: uniId,
        academic_session: academicSession,
        semester: course.semester,
        is_active: true,
      });
      if (err) throw new Error(err.message);

      await upsertLecturerCourseAssignment({
        lecturerId: newLecturerId,
        courseId: newCourseId,
        universityId: uniId!,
        semester: course.semester,
        academicSession,
      });
      setNewCourseId("");
      setNewLecturerId("");
      setNewVenue("");
      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save slot");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this timetable slot?")) return;
    await supabase.from("timetable").delete().eq("id", id);
    loadData();
  }

  const filtered = slots.filter((s) => {
    const matchLevel = s.course_level === activeLevel;
    const matchDay = s.day === activeDay;
    const matchSearch =
      s.course_name.toLowerCase().includes(search.toLowerCase()) ||
      s.course_code.toLowerCase().includes(search.toLowerCase()) ||
      s.lecturer_name.toLowerCase().includes(search.toLowerCase());

    return matchLevel && matchDay && matchSearch;
  });

  const daySlots = filtered;
  const conflictCount = slots.filter((s) => s.conflict).length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          {/* Back button */}
          <button
            onClick={() =>
              router.push(
                activeDept
                  ? `/u/departments?faculty=${activeDept.faculty}`
                  : "/u/faculties",
              )
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "12px",
              padding: "0 0 4px 0",
              cursor: "pointer",
              marginBottom: "2px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--brand)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            }}
          >
            <ArrowLeft size={13} /> Back to Departments
          </button>

          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            {activeDept ? `${activeDept.name} Timetable` : "Timetable"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {activeDept?.short_name && (
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: 600,
                  marginRight: "8px",
                }}
              >
                {activeDept.short_name}
              </span>
            )}
            {slots.length} scheduled slot{slots.length !== 1 ? "s" : ""}
            {conflictCount > 0 && (
              <span style={{ color: "var(--danger)", marginLeft: "8px" }}>
                · {conflictCount} conflict{conflictCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          <button
            onClick={downloadTemplate}
            className="btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
            }}
          >
            ↓ CSV Template
          </button>
          <label style={{ cursor: importing || !activeDept ? "not-allowed" : "pointer" }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              style={{ display: "none" }}
              disabled={importing || !activeDept}
            />
            <span
              className="btn-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                cursor: importing || !activeDept ? "not-allowed" : "pointer",
                opacity: importing || !activeDept ? 0.6 : 1,
              }}
            >
              {importing ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Importing...
                </>
              ) : (
                "↑ Import CSV"
              )}
            </span>
          </label>
          <button
            onClick={() => setShowModal(true)}
            disabled={!activeDept}
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: activeDept ? 1 : 0.5,
            }}
          >
            <Plus size={15} /> Add Slot
          </button>
        </div>
      </div>

      {/* Import success */}
      {importSuccess > 0 && importErrors.length === 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--success-muted)",
            border: "1px solid var(--success-muted)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
          }}
        >
          <p style={{ fontSize: "13px", color: "var(--success)" }}>
            ✓ {importSuccess} slot{importSuccess !== 1 ? "s" : ""} imported
            successfully
            {importCorrected > 0 ? ` (${importCorrected} lecturer email domain${importCorrected !== 1 ? "s" : ""} auto-corrected)` : ""}
          </p>
          <button
            onClick={() => { setImportSuccess(0); setImportCorrected(0); }}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={14} style={{ color: "var(--success)" }} />
          </button>
        </div>
      )}

      {/* Import errors */}
      {importErrors.length > 0 && (
        <div
          style={{
            background: "var(--danger-muted)",
            border: "1px solid var(--danger-muted)",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--danger)",
              }}
            >
              {importSuccess > 0 ? `${importSuccess} imported, ` : ""}
              {importErrors.length} error{importErrors.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => {
                setImportErrors([]);
                setImportSuccess(0);
                setImportCorrected(0);
              }}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <X size={14} style={{ color: "var(--danger)" }} />
            </button>
          </div>
          {importErrors.map((err, i) => (
            <p
              key={i}
              style={{
                fontSize: "12px",
                color: "var(--danger)",
                lineHeight: 1.6,
              }}
            >
              • {err}
            </p>
          ))}
        </div>
      )}

      {fetchError && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            background: "var(--danger-muted)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
          }}
        >
          <AlertCircle size={16} style={{ color: "var(--danger)" }} />
          <p style={{ fontSize: "13px", color: "var(--danger)" }}>
            Failed to load timetable data: {fetchError}
          </p>
        </div>
      )}

      {/* Conflict banner */}
      {conflictCount > 0 && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            background: "var(--danger-muted)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
          }}
        >
          <AlertTriangle
            size={16}
            style={{ color: "var(--danger)", flexShrink: 0 }}
          />
          <p style={{ fontSize: "13px", color: "var(--danger)" }}>
            {conflictCount} timetable conflict{conflictCount !== 1 ? "s" : ""}{" "}
            detected. Slots marked in red have overlapping venues or lecturers.
          </p>
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <LevelTabs
          levels={levelTabs}
          activeLevel={activeLevel}
          onChange={(level) => setActiveLevel(level as CourseLevel)}
          counts={levelCounts}
        />
      </div>

      {/* Search */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search course or lecturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{
              width: "100%",
              paddingLeft: "38px",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Day tabs */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {DAYS.map((day) => {
          const count = slots.filter(
            (s) => s.day === day && s.course_level === activeLevel,
          ).length;
          const hasConflict = slots.some(
            (s) =>
              s.day === day &&
              s.course_level === activeLevel &&
              s.conflict,
          );
          const active = day === activeDay;
          const color = DAY_COLORS[day];
          const mutedColor = DAY_MUTED_COLORS[day];
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                border: active
                  ? `1px solid ${color}`
                  : "1px solid var(--border-primary)",
                background: active ? mutedColor : "transparent",
                fontSize: "13px",
                fontWeight: active ? 600 : 400,
                color: active ? color : "var(--text-muted)",
                transition: "all var(--transition)",
              }}
            >
              {day}
              <span
                style={{
                  fontSize: "11px",
                  background: active
                    ? "rgba(255,255,255,0.08)"
                    : "var(--bg-hover)",
                  borderRadius: "4px",
                  padding: "1px 5px",
                  color: active ? color : "var(--text-muted)",
                }}
              >
                {count}
              </span>
              {hasConflict && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--danger)",
                    flexShrink: 0,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Slots Grid */}
      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "var(--brand)" }}
          />
        </div>
      ) : daySlots.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            border: "1px dashed var(--border-primary)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <CalendarDays
            size={32}
            style={{ color: "var(--text-muted)", marginBottom: "12px" }}
          />
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            No {activeLevel} level classes on {activeDay}. Add a slot to get
            started.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "14px",
          }}
        >
          {daySlots
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
            .map((slot) => (
              <SlotCard key={slot.id} slot={slot} onDelete={handleDelete} />
            ))}
        </div>
      )}

      {/* Add Slot Modal */}
      {showModal && (
        <Modal
          title="Add Timetable Slot"
          onClose={() => {
            setShowModal(false);
            setError("");
          }}
        >
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {error && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  background: "var(--danger-muted)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                }}
              >
                <AlertCircle size={14} style={{ color: "var(--danger)" }} />
                <p style={{ fontSize: "12px", color: "var(--danger)" }}>
                  {error}
                </p>
              </div>
            )}
            {conflictCheck && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start",
                  background: "var(--warning-muted)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                }}
              >
                <AlertTriangle
                  size={14}
                  style={{
                    color: "var(--warning)",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                />
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--warning)",
                    lineHeight: 1.5,
                  }}
                >
                  {conflictCheck}
                </p>
              </div>
            )}
            {levelCourses.length === 0 ? (
              <div
                style={{
                  background: "var(--warning-muted)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--warning)",
                    lineHeight: 1.5,
                  }}
                >
                  No {activeLevel} level courses in this department yet.{" "}
                  {activeDept && (
                    <Link
                      href={`/u/courses?department=${activeDept.id}&faculty=${activeDept.faculty}`}
                      style={{ color: "var(--brand)", fontWeight: 600 }}
                    >
                      Create {activeLevel} level courses first
                    </Link>
                  )}
                </p>
              </div>
            ) : null}
            <div>
              <label
                className="label"
                style={{ display: "block", marginBottom: "6px" }}
              >
                Course
              </label>
              <div style={{ position: "relative" }}>
                <select
                  required
                  value={newCourseId}
                  onChange={(e) => {
                    const courseId = e.target.value;
                    setNewCourseId(courseId);
                    setNewLecturerId("");
                    const assigned = courseAssignments[courseId] ?? [];
                    if (assigned.length === 1) {
                      setNewLecturerId(assigned[0]);
                    }
                  }}
                  className="select"
                  style={{ paddingRight: "32px", boxSizing: "border-box" }}
                >
                  <option value="" disabled>
                    Select course...
                  </option>
                  {levelCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
            <div>
              <label
                className="label"
                style={{ display: "block", marginBottom: "6px" }}
              >
                Lecturer
              </label>
              {selectedCourse &&
                (courseAssignments[selectedCourse.id] ?? []).length > 0 && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                    }}
                  >
                    Assigned lecturers shown first. You can still pick any staff
                    member for this slot.
                  </p>
                )}
              <div style={{ position: "relative" }}>
                <select
                  required
                  value={newLecturerId}
                  onChange={(e) => setNewLecturerId(e.target.value)}
                  className="select"
                  style={{ paddingRight: "32px", boxSizing: "border-box" }}
                >
                  <option value="" disabled>
                    Select lecturer...
                  </option>
                  {modalLecturers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name}
                      {(courseAssignments[newCourseId] ?? []).includes(l.id)
                        ? " (assigned)"
                        : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <label
                  className="label"
                  style={{ display: "block", marginBottom: "6px" }}
                >
                  Day
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    required
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="select"
                    style={{ paddingRight: "28px", boxSizing: "border-box" }}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
              <div>
                <label
                  className="label"
                  style={{ display: "block", marginBottom: "6px" }}
                >
                  Venue
                </label>
                <input
                  required
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="LT 1, Hall A..."
                  className="input"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <label
                  className="label"
                  style={{ display: "block", marginBottom: "6px" }}
                >
                  Start Time
                </label>
                <select
                  required
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="select"
                  style={{ boxSizing: "border-box" }}
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="label"
                  style={{ display: "block", marginBottom: "6px" }}
                >
                  End Time
                </label>
                <select
                  required
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="select"
                  style={{ boxSizing: "border-box" }}
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !!conflictCheck || levelCourses.length === 0}
                className="btn-primary"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  opacity: conflictCheck ? 0.5 : 1,
                }}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Add Slot"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
