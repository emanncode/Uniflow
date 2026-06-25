"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useUniversity } from "@/context/UniversityContext";
import { getCurrentAcademicSession } from "@/lib/academic";
import { type CourseLevel, ALL_COURSE_LEVELS, formatLevelTab } from "@/lib/course-levels";
import { CalendarDays, Loader2 } from "lucide-react";

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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

function formatTime(time: string) {
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function slotStyle(start: string, end: string) {
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const dayStart = toMinutes("08:00");
  const totalMin = 11 * 60;
  const top = ((startMin - dayStart) / totalMin) * 100;
  const height = ((endMin - startMin) / totalMin) * 100;
  return { top: `${top}%`, height: `${height}%` };
}

export default function TimetablePage() {
  const { universityId, isReady } = useUniversity();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLevel, setActiveLevel] = useState<CourseLevel>(100);

  useEffect(() => {
    if (!isReady || !universityId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");

    const sessionYear = getCurrentAcademicSession();

    supabase
      .from("timetable")
      .select("*, courses!inner(code, title, level)")
      .eq("university_id", universityId)
      .eq("is_active", true)
      .eq("academic_session", sessionYear)
      .order("day_of_week")
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setEntries((data as unknown as TimetableEntry[]) || []);
        }
        setLoading(false);
      });
  }, [isReady, universityId]);

  const filtered = useMemo(() => {
    return entries.filter((e) => e.courses?.level === activeLevel);
  }, [entries, activeLevel]);

  const slotsByDay = useMemo(() => {
    const map: Record<string, TimetableEntry[]> = {};
    for (const day of DAYS) map[day] = [];
    for (const entry of filtered) {
      const day = entry.day_of_week;
      if (map[day]) map[day].push(entry);
    }
    for (const day of DAYS) {
      map[day].sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
    }
    return map;
  }, [filtered]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Timetable
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {getCurrentAcademicSession()} · {filtered.length} slot{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

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
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "var(--text-muted)",
          }}
        >
          <CalendarDays size={40} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
          <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-secondary)" }}>
            No timetable entries for {formatLevelTab(activeLevel)}
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
              gridTemplateColumns: "70px repeat(5, 1fr)",
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
            {DAYS.map((day) => (
              <div
                key={day}
                style={{
                  padding: "10px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textAlign: "center",
                  borderRight: day !== "Friday" ? "1px solid var(--border-primary)" : "none",
                }}
              >
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Time rows */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px repeat(5, 1fr)",
            }}
          >
            {HOURS.map((hour, i) => (
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
                {DAYS.map((day) => {
                  const slots = slotsByDay[day].filter(
                    (s) => s.start_time >= hour && s.start_time < HOURS[i + 1],
                  );
                  return (
                    <div
                      key={`${day}-${hour}`}
                      style={{
                        borderRight: day !== "Friday" ? "1px solid var(--border-primary)" : "none",
                        borderBottom: i < HOURS.length - 1 ? "1px solid var(--border-primary)" : "none",
                        minHeight: "48px",
                        padding: "4px",
                        position: "relative",
                      }}
                    >
                      {slots.map((slot) => (
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
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
