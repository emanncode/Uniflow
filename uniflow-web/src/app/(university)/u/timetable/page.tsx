"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUniversity } from "@/context/UniversityContext";
import { getCurrentAcademicSession } from "@/lib/academic";
import { type CourseLevel, ALL_COURSE_LEVELS, formatLevelTab } from "@/lib/course-levels";
import { CalendarDays, Loader2, ArrowLeft } from "lucide-react";

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
      const { data: ttData, error: ttError } = await supabase
        .from("timetable")
        .select("*, courses!inner(code, title, level)")
        .eq("university_id", universityId)
        .eq("department_id", dept.id)
        .eq("is_active", true)
        .eq("academic_session", sessionYear)
        .order("day_of_week");

      if (ttError) {
        setError(ttError.message);
      } else {
        setEntries((ttData as unknown as TimetableEntry[]) || []);
      }
      setLoading(false);
    })();
  }, [isReady, universityId, deptParam]);

  useEffect(() => {
    if (isReady && !deptParam) {
      router.replace("/u/faculties");
    }
  }, [isReady, deptParam, router]);

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
    </div>
  );
}
