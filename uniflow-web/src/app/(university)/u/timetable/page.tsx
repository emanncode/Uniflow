"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUniversity } from "@/context/UniversityContext";
import { getCurrentAcademicSession, getAcademicContext, displayDayToDb, dbDayToDisplay } from "@/lib/academic";
import { type CourseLevel, ALL_COURSE_LEVELS, formatLevelTab } from "@/lib/course-levels";
import { CalendarDays, Loader2, ArrowLeft, Plus } from "lucide-react";
import { fetchCourseAssignments } from "@/lib/lecturer-courses";

interface TimetableEntry {
  id: string;
  course_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  venue: string;
  semester: number;
  courses?: { code: string; title: string; level: number } | null;
}

interface UnscheduledCourse {
  id: string;
  code: string;
  title: string;
  level: number;
  semester: 1 | 2;
  assignedLecturers: { id: string; full_name: string }[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
};

const HOURS = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

const TODAY_INDEX = new Date().getDay();
const DEFAULT_DAY = TODAY_INDEX >= 1 && TODAY_INDEX <= 5
  ? DAYS[TODAY_INDEX - 1]
  : "Monday";

function formatTime(time: string) {
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default function TimetablePage() {
  const { universityId, isReady } = useUniversity();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deptParam = searchParams.get("department");
  const facultyParam = searchParams.get("faculty");

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [deptId, setDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLevel, setActiveLevel] = useState<CourseLevel>(100);
  const [selectedDay, setSelectedDay] = useState<string>(DEFAULT_DAY);
  const [unscheduledCourses, setUnscheduledCourses] = useState<UnscheduledCourse[]>([]);
  const [unscheduledLoading, setUnscheduledLoading] = useState(false);
  const [quickSlotCourseId, setQuickSlotCourseId] = useState<string | null>(null);
  const [quickSlotDay, setQuickSlotDay] = useState("Monday");
  const [quickSlotStart, setQuickSlotStart] = useState("08:00");
  const [quickSlotEnd, setQuickSlotEnd] = useState("10:00");
  const [quickSlotVenue, setQuickSlotVenue] = useState("");
  const [quickSlotSaving, setQuickSlotSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isReady || !universityId || !deptParam) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");

    (async () => {
      let dept: { id: string; name: string } | null = null;

      const { data: byId } = await supabase
        .from("departments")
        .select("id, name")
        .eq("id", deptParam)
        .eq("university_id", universityId)
        .maybeSingle();

      if (byId) {
        dept = byId;
      } else {
        const { data: byShort } = await supabase
          .from("departments")
          .select("id, name")
          .eq("short_name", deptParam)
          .eq("university_id", universityId)
          .maybeSingle();
        dept = byShort ?? null;
      }

      if (!dept) {
        setError("Department not found");
        setLoading(false);
        return;
      }

      setDeptId(dept.id);
      setDeptName(dept.name);

      const sessionYear = getCurrentAcademicSession();

      // Fetch all courses for this department (used for both merge and unscheduled)
      const { data: allCourses } = await supabase
        .from("courses")
        .select("id, code, title, level, semester")
        .eq("university_id", universityId)
        .eq("department_id", dept.id)
        .eq("is_active", true);

      const courseMap = new Map<string, { code: string; title: string; level: number }>();
      for (const c of allCourses ?? []) {
        courseMap.set(c.id, { code: c.code, title: c.title, level: c.level });
      }

      // Fetch timetable entries (without relying on FK join)
      const { data: ttData, error: ttError } = await supabase
        .from("timetable")
        .select("*")
        .eq("university_id", universityId)
        .eq("department_id", dept.id)
        .eq("is_active", true)
        .eq("academic_session", sessionYear)
        .order("day_of_week");

      if (ttError) {
        setError(ttError.message);
        setLoading(false);
        return;
      }

      const rawEntries = (ttData as unknown as TimetableEntry[]) || [];
      console.log("[timetable] dept.id:", dept.id);
      console.log("[timetable] universityId:", universityId);
      console.log("[timetable] sessionYear:", sessionYear);
      console.log("[timetable] raw timetable rows:", rawEntries.length, rawEntries);
      console.log("[timetable] courseMap size:", courseMap.size, "ids:", Array.from(courseMap.keys()));
      // Merge course info into entries, filtering out entries with missing courses
      const mergedEntries = rawEntries.filter((e) => courseMap.has(e.course_id)).map((e) => ({
        ...e,
        day_of_week: dbDayToDisplay(e.day_of_week),
        courses: courseMap.get(e.course_id) ?? null,
      }));
      console.log("[timetable] merged entries:", mergedEntries.length, mergedEntries);

      setEntries(mergedEntries);

      console.log("[timetable] all courses:", allCourses?.length, allCourses);
      // Fetch unscheduled courses (courses with no active timetable slot)
      setUnscheduledLoading(true);
      const scheduledCourseIds = new Set(mergedEntries.map((e) => e.course_id));
      const unscheduledRaw = (allCourses ?? []).filter((c) => !scheduledCourseIds.has(c.id));
      console.log("[timetable] unscheduled courses:", unscheduledRaw.length, unscheduledRaw);

      if (unscheduledRaw.length > 0) {
        const unscheduledIds = unscheduledRaw.map((c) => c.id);
        let assignmentMap: Record<string, { id: string; full_name: string }[]> = {};
        try {
          assignmentMap = await fetchCourseAssignments({
            universityId,
            courseIds: unscheduledIds,
            academicSession: sessionYear,
          });
        } catch {
          // proceed without assignments
        }
        setUnscheduledCourses(
          unscheduledRaw.map((c) => ({
            id: c.id,
            code: c.code,
            title: c.title,
            level: c.level,
            semester: c.semester as 1 | 2,
            assignedLecturers: assignmentMap[c.id] ?? [],
          })),
        );
      } else {
        setUnscheduledCourses([]);
      }
      setUnscheduledLoading(false);
      setLoading(false);
    })();
  }, [isReady, universityId, deptParam, refreshKey]);

  useEffect(() => {
    if (isReady && !deptParam) {
      router.replace("/u/faculties");
    }
  }, [isReady, deptParam, router]);

  async function handleQuickAddSlot(courseId: string) {
    if (!deptId || !universityId || !quickSlotVenue.trim()) return;
    setQuickSlotSaving(true);
    setError("");
    try {
      if (quickSlotStart >= quickSlotEnd) throw new Error("End time must be after start time");
      const course = unscheduledCourses.find((c) => c.id === courseId);
      if (!course) throw new Error("Course not found");
      if (course.assignedLecturers.length === 0) {
        throw new Error("Assign a lecturer to this course first");
      }
      const ctx = getAcademicContext();
      const { error: slotError } = await supabase.from("timetable").insert({
        course_id: courseId,
        lecturer_id: course.assignedLecturers[0].id,
        department_id: deptId,
        university_id: universityId,
        venue: quickSlotVenue.trim(),
        day_of_week: displayDayToDb(quickSlotDay),
        start_time: quickSlotStart,
        end_time: quickSlotEnd,
        academic_session: ctx.academic_session,
        semester: course.semester,
        is_active: true,
      });
      if (slotError) throw new Error(slotError.message);
      setQuickSlotCourseId(null);
      setQuickSlotVenue("");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add slot");
    } finally {
      setQuickSlotSaving(false);
    }
  }

  function loadData() {
    setRefreshKey((k) => k + 1);
  }

  const filtered = useMemo(() => {
    return entries.filter((e) => e.courses?.level === activeLevel);
  }, [entries, activeLevel]);

  const slotsForDay = useMemo(() => {
    return filtered
      .filter((e) => e.day_of_week === selectedDay)
      .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
  }, [filtered, selectedDay]);

  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const day of DAYS) counts[day] = 0;
    for (const entry of filtered) {
      if (counts[entry.day_of_week] !== undefined) counts[entry.day_of_week]++;
    }
    return counts;
  }, [filtered]);

  const unscheduledFiltered = useMemo(() => {
    return unscheduledCourses.filter((c) => c.level === activeLevel);
  }, [unscheduledCourses, activeLevel]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "20px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <button
            onClick={() =>
              router.push(
                facultyParam
                  ? `/u/departments?faculty=${facultyParam}`
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
            {deptName ? `${deptName} Timetable` : "Timetable"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {getCurrentAcademicSession()} · {facultyParam ? `${facultyParam} Faculty` : ""} · {formatLevelTab(activeLevel)} · {slotsForDay.length} slot{slotsForDay.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-start" }}>
          <select
            value={activeLevel}
            onChange={(e) => setActiveLevel(Number(e.target.value) as CourseLevel)}
            className="input"
            style={{ width: "auto", minWidth: "140px" }}
          >
            {ALL_COURSE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {formatLevelTab(level)}
              </option>
            ))}
          </select>
          {deptId && (
            <Link
              href={`/u/courses?department=${deptId}&faculty=${facultyParam || ""}`}
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              <CalendarDays size={14} /> Courses
            </Link>
          )}
        </div>
      </div>

      {/* Day tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const count = dayCounts[day] ?? 0;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: `1px solid ${isSelected ? "var(--brand)" : "var(--border-primary)"}`,
                background: isSelected ? "var(--brand)" : "var(--bg-card)",
                color: isSelected ? "#fff" : "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              {DAY_SHORT[day]}
              {count > 0 && (
                <span
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.2)" : "var(--brand-muted)",
                    color: isSelected ? "#fff" : "var(--brand)",
                    borderRadius: "10px",
                    padding: "1px 7px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div
          style={{
            background: "var(--danger-muted)",
            border: "1px solid var(--danger)",
            color: "var(--danger)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 0",
            gap: "8px",
            color: "var(--text-muted)",
            fontSize: "14px",
          }}
        >
          <Loader2 size={18} className="animate-spin" />
          Loading timetable...
        </div>
      ) : slotsForDay.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "var(--text-muted)",
          }}
        >
          <CalendarDays size={40} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
          <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-secondary)" }}>
            No {selectedDay} slots for {formatLevelTab(activeLevel)}
          </p>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>
            Add courses with timetable slots on the Courses page to see them here.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-md)",
            overflow: "auto",
          }}
        >
          {/* Grid header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr",
              borderBottom: "1px solid var(--border-primary)",
              position: "sticky",
              top: 0,
              background: "var(--bg-card)",
              zIndex: 1,
            }}
          >
            <div
              style={{
                padding: "10px 8px",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textAlign: "center",
                borderRight: "1px solid var(--border-primary)",
              }}
            >
              Time
            </div>
            <div
              style={{
                padding: "10px 8px",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textAlign: "center",
              }}
            >
              {selectedDay}
            </div>
          </div>

          {/* Time rows */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr",
            }}
          >
            {HOURS.map((hour, i) => {
              const cellSlots = slotsForDay.filter(
                (s) => s.start_time >= hour && s.start_time < HOURS[i + 1],
              );
              return (
                <div key={hour} style={{ display: "contents" }}>
                  <div
                    style={{
                      padding: "6px 8px",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      textAlign: "center",
                      borderRight: "1px solid var(--border-primary)",
                      borderBottom: i < HOURS.length - 1 ? "1px solid var(--border-primary)" : "none",
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      paddingTop: "8px",
                    }}
                  >
                    {hour}
                  </div>
                  <div
                    style={{
                      borderBottom: i < HOURS.length - 1 ? "1px solid var(--border-primary)" : "none",
                      minHeight: "48px",
                      padding: "4px",
                    }}
                  >
                    {cellSlots.map((slot) => (
                      <div
                        key={slot.id}
                        style={{
                          background: "var(--brand-muted)",
                          border: "1px solid var(--border-brand)",
                          borderRadius: "var(--radius-sm)",
                          padding: "3px 6px",
                          fontSize: "10px",
                          lineHeight: 1.4,
                          marginBottom: "2px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--brand)",
                            fontSize: "10px",
                          }}
                        >
                          {slot.courses?.code}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "9px" }}>
                          {slot.venue}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "9px" }}>
                          {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unscheduled Courses */}
      {!loading && !unscheduledLoading && unscheduledFiltered.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Unscheduled Courses
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                background: "var(--bg-secondary)",
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              {unscheduledFiltered.length}
            </span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {unscheduledFiltered.map((course) => (
              <div
                key={course.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {course.code}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {course.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      {formatLevelTab(course.level)} · Sem {course.semester}
                    </div>
                  </div>

                  {quickSlotCourseId === course.id ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        minWidth: "200px",
                      }}
                    >
                      <select
                        value={quickSlotDay}
                        onChange={(e) => setQuickSlotDay(e.target.value)}
                        className="select"
                        style={{ fontSize: "11px", width: "100%", boxSizing: "border-box" }}
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>{DAY_SHORT[d]}</option>
                        ))}
                      </select>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                        <select
                          value={quickSlotStart}
                          onChange={(e) => setQuickSlotStart(e.target.value)}
                          className="select"
                          style={{ fontSize: "11px", boxSizing: "border-box" }}
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <select
                          value={quickSlotEnd}
                          onChange={(e) => setQuickSlotEnd(e.target.value)}
                          className="select"
                          style={{ fontSize: "11px", boxSizing: "border-box" }}
                        >
                          {HOURS.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        value={quickSlotVenue}
                        onChange={(e) => setQuickSlotVenue(e.target.value)}
                        placeholder="Venue"
                        className="input"
                        style={{ fontSize: "11px", width: "100%", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => { setQuickSlotCourseId(null); setQuickSlotVenue(""); }}
                          className="btn-secondary"
                          style={{ flex: 1, fontSize: "11px", padding: "6px 8px" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={quickSlotSaving || !quickSlotVenue.trim() || course.assignedLecturers.length === 0}
                          onClick={() => handleQuickAddSlot(course.id)}
                          className="btn-primary"
                          style={{
                            flex: 1,
                            fontSize: "11px",
                            padding: "6px 8px",
                            opacity: quickSlotSaving || !quickSlotVenue.trim() ? 0.5 : 1,
                          }}
                        >
                          {quickSlotSaving ? <Loader2 size={12} className="animate-spin" /> : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setQuickSlotCourseId(course.id);
                        setQuickSlotDay("Monday");
                        setQuickSlotStart("08:00");
                        setQuickSlotEnd("10:00");
                        setQuickSlotVenue("");
                        setError("");
                      }}
                      disabled={course.assignedLecturers.length === 0}
                      title={
                        course.assignedLecturers.length === 0
                          ? "Assign a lecturer on the Courses page first"
                          : "Add schedule slot"
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "6px 12px",
                        fontSize: "11px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-primary)",
                        background: "none",
                        cursor: course.assignedLecturers.length === 0 ? "not-allowed" : "pointer",
                        color: "var(--text-muted)",
                        opacity: course.assignedLecturers.length === 0 ? 0.5 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Plus size={12} />
                      {course.assignedLecturers.length === 0 ? "No Lecturer" : "Add Slot"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
