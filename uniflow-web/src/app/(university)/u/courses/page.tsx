"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUniversity } from "@/context/UniversityContext";
import { LECTURER_ROLES, staffApiUrl } from "@/lib/staff-api";
import { getCurrentAcademicSession, getAcademicContext, displayDayToDb, dbDayToDisplay } from "@/lib/academic";
import {
  fetchCourseAssignments,
  syncLecturerCourseAssignments,
} from "@/lib/lecturer-courses";
import {
  type CourseLevel,
  type MaxCourseLevel,
  getCourseLevels,
} from "@/lib/course-levels";
import LevelTabs from "@/components/ui/LevelTabs";
import {
  BookOpen, Plus, Search, Loader2, Trash2, ArrowLeft, AlertCircle, UserCheck, X,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface Department {
  id: string;
  name: string;
  short_name: string;
  faculty: string;
  max_course_level: MaxCourseLevel | null;
}

interface Lecturer {
  id: string;
  full_name: string;
  email: string;
  faculty: string | null;
}

interface CourseRow {
  id: string;
  title: string;
  code: string;
  level: number;
  semester: 1 | 2;
  credit_units: number;
  description: string | null;
  is_active: boolean;
  assignedLecturers: { id: string; full_name: string }[];
}

interface TimetableSlot {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  venue: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
const HOURS = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

const COMBINED_CSV_TEMPLATE = `course_code,course_title,level,semester,credit_units,lecturer_email,day,start_time,end_time,venue
CSC301,Data Structures,300,1,3,lecturer@uni.edu,Monday,08:00,10:00,LT1
CSC301,Data Structures,300,1,3,lecturer@uni.edu,Wednesday,14:00,16:00,Lab2
MTH201,Calculus II,200,2,3,other@uni.edu,,,,
GEG101,Intro to Geology,100,1,2,,Thursday,10:00,12:00,GH-101`;

export default function CoursesPage() {
  const { universityId: contextUniId, isReady } = useUniversity();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [uniId, setUniId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [assignSuccess, setAssignSuccess] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignCourse, setAssignCourse] = useState<CourseRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CourseRow | null>(null);

  const [activeLevel, setActiveLevel] = useState<CourseLevel>(100);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newLevel, setNewLevel] = useState<CourseLevel>(100);
  const [newSemester, setNewSemester] = useState<"1" | "2">("1");
  const [newCreditUnits, setNewCreditUnits] = useState("3");
  const [newDescription, setNewDescription] = useState("");
  const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>([]);

  const [slotsByCourse, setSlotsByCourse] = useState<Record<string, TimetableSlot[]>>({});
  const [expandedSlotCourseId, setExpandedSlotCourseId] = useState<string | null>(null);
  const [slotDay, setSlotDay] = useState("Monday");
  const [slotStart, setSlotStart] = useState("08:00");
  const [slotEnd, setSlotEnd] = useState("10:00");
  const [slotVenue, setSlotVenue] = useState("");

  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(0);
  const [importSummary, setImportSummary] = useState("");
  const [skippedLecturers, setSkippedLecturers] = useState<{ course_code: string; course_title: string; lecturer_email: string }[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const deptParam = searchParams.get("department");
  const facultyParam = searchParams.get("faculty");

  const academicCtx = useMemo(() => getAcademicContext(), []);

  const activeDept = useMemo(() => {
    if (!deptParam || departments.length === 0) return null;
    return (
      departments.find(
        (d) => d.id === deptParam || d.short_name === deptParam,
      ) ?? null
    );
  }, [deptParam, departments]);

  const facultyLecturers = useMemo(() => {
    if (!activeDept) return lecturers;
    return lecturers.filter(
      (l) => !l.faculty || l.faculty === activeDept.faculty,
    );
  }, [lecturers, activeDept]);

  const maxCourseLevel = (activeDept?.max_course_level ?? 400) as MaxCourseLevel;

  const levelTabs = useMemo(
    () => getCourseLevels(maxCourseLevel),
    [maxCourseLevel],
  );

  const levelCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const level of levelTabs) counts[level] = 0;
    for (const course of courses) {
      if (counts[course.level] !== undefined) counts[course.level]++;
    }
    return counts;
  }, [courses, levelTabs]);

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.level === activeLevel &&
        (c.title.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.assignedLecturers.some((l) =>
            l.full_name.toLowerCase().includes(q),
          )),
    );
  }, [courses, search, activeLevel]);

  useEffect(() => {
    if (!levelTabs.includes(activeLevel)) {
      setActiveLevel((levelTabs[0] ?? 100) as CourseLevel);
    }
  }, [levelTabs, activeLevel]);

  useEffect(() => {
    if (departments.length === 0) return;
    if (!deptParam || !activeDept) {
      router.replace("/u/faculties");
    }
  }, [departments, deptParam, activeDept, router]);

  const loadData = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchPageData() {
      if (!contextUniId) {
        if (!cancelled) setLoading(false);
        return;
      }

      setFetchError("");
      if (!cancelled) setUniId(contextUniId);

      const { data: deptRes } = await supabase
        .from("departments")
        .select("id, name, short_name, faculty, max_course_level")
        .eq("university_id", contextUniId)
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

      const [courseRes, staffRes, facRes, deptFullRes] = await Promise.all([
        supabase
          .from("courses")
          .select(
            "id, title, code, level, semester, credit_units, description, is_active",
          )
          .eq("university_id", contextUniId)
          .eq("department_id", departmentId)
          .order("code"),
        fetch(staffApiUrl(contextUniId, { roles: LECTURER_ROLES })),
        supabase
          .from("faculties")
          .select("id, short_name, dean_id")
          .eq("university_id", contextUniId),
        supabase
          .from("departments")
          .select("id, faculty, hod_id")
          .eq("university_id", contextUniId),
      ]);

      if (cancelled) return;

      if (courseRes.error) {
        setFetchError(courseRes.error.message);
        setCourses([]);
      }

      const courseList = courseRes.data ?? [];
      const courseIds = courseList.map((c) => c.id);

      const sessionYear = getCurrentAcademicSession();
      let assignmentMap: Record<string, { id: string; full_name: string }[]> =
        {};

      if (courseIds.length > 0) {
        try {
          assignmentMap = await fetchCourseAssignments({
            universityId: contextUniId,
            courseIds,
            academicSession: sessionYear,
          });
        } catch (assignErr: unknown) {
          const message =
            assignErr instanceof Error
              ? assignErr.message
              : "Failed to load lecturer assignments";
          if (!cancelled) setFetchError(message);
        }
      }

      setCourses(
        courseList.map((c) => ({
          ...c,
          semester: c.semester as 1 | 2,
          assignedLecturers: assignmentMap[c.id] ?? [],
        })),
      );

      const { data: slotData } = await supabase
        .from("timetable")
        .select("id, course_id, day_of_week, start_time, end_time, venue")
        .eq("department_id", departmentId)
        .eq("is_active", true)
        .eq("academic_session", sessionYear)
        .order("day_of_week");

      if (!cancelled && slotData) {
        const grouped: Record<string, TimetableSlot[]> = {};
        for (const s of slotData) {
          if (!grouped[s.course_id]) grouped[s.course_id] = [];
          grouped[s.course_id].push({
            id: s.id,
            day: dbDayToDisplay(s.day_of_week),
            start_time: s.start_time.slice(0, 5),
            end_time: s.end_time.slice(0, 5),
            venue: s.venue,
          });
        }
        setSlotsByCourse(grouped);
      }

      const staffData = await staffRes.json();
      const lecturerProfiles = staffRes.ok ? (staffData.data ?? []) : [];
      const facData = facRes.data ?? [];
      const deptData = deptFullRes.data ?? [];

      const deptMap: Record<string, string> = {};
      deptData.forEach((d) => {
        deptMap[d.id] = d.faculty;
      });
      const deanMap: Record<string, string> = {};
      facData.forEach((f) => {
        if (f.dean_id) deanMap[f.dean_id] = f.short_name;
      });
      const hodMap: Record<string, string> = {};
      deptData.forEach((d) => {
        if (d.hod_id) hodMap[d.hod_id] = d.faculty;
      });

      const mappedLecturers: Lecturer[] = lecturerProfiles
        .map((l: {
          id: string;
          full_name: string;
          email: string;
          role: string;
          department_id: string | null;
          faculty: string | null;
        }) => {
          let fac = l.department_id
            ? (deptMap[l.department_id] ?? l.faculty)
            : l.faculty;
          if (l.role === "dean" && !fac) fac = deanMap[l.id] ?? null;
          if (l.role === "hod" && !fac) fac = hodMap[l.id] ?? null;
          return {
            id: l.id,
            full_name: l.full_name || "Unknown",
            email: l.email || "",
            faculty: fac,
          };
        });

      setLecturers(mappedLecturers);
      setLoading(false);
    }

    if (isReady) {
      void fetchPageData();
    }

    return () => {
      cancelled = true;
    };
  }, [deptParam, refreshKey, isReady, contextUniId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!activeDept || !uniId) return;
    setError("");
    setSaving(true);
    try {
      const createRes = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university_id: uniId,
          department_id: activeDept.id,
          title: newTitle.trim(),
          code: newCode.trim().toUpperCase(),
          level: newLevel,
          semester: parseInt(newSemester, 10) as 1 | 2,
          credit_units: parseInt(newCreditUnits, 10),
          description: newDescription.trim() || null,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to create course");
      }

      setNewTitle("");
      setNewCode("");
      setNewLevel(100);
      setNewSemester("1");
      setNewCreditUnits("3");
      setNewDescription("");
      setActiveLevel(newLevel);
      setShowCreateModal(false);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignLecturers(e: React.FormEvent) {
    e.preventDefault();
    if (!assignCourse) return;
    if (!uniId) {
      setError("Session expired — refresh the page and try again.");
      return;
    }
    setError("");
    setAssignSuccess("");
    setSaving(true);
    try {
      await syncLecturerCourseAssignments({
        courseId: assignCourse.id,
        universityId: uniId,
        semester: assignCourse.semester,
        lecturerIds: selectedLecturerIds,
      });

      const updated = await fetchCourseAssignments({
        universityId: uniId,
        courseIds: [assignCourse.id],
      });

      setCourses((prev) =>
        prev.map((c) =>
          c.id === assignCourse.id
            ? { ...c, assignedLecturers: updated[assignCourse.id] ?? [] }
            : c,
        ),
      );

      setAssignSuccess(
        `Saved ${selectedLecturerIds.length} lecturer assignment${selectedLecturerIds.length !== 1 ? "s" : ""} for ${assignCourse.code}.`,
      );
      setAssignCourse(null);
      setSelectedLecturerIds([]);
      loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to assign lecturers",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course: CourseRow) {
    if (!uniId) return;
    setSaving(true);
    const res = await fetch("/api/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        university_id: uniId,
        course_id: course.id,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to delete course");
      setSaving(false);
      return;
    }
    setConfirmDelete(null);
    setSaving(false);
    loadData();
  }

  function openAssignModal(course: CourseRow) {
    setAssignCourse(course);
    setSelectedLecturerIds(course.assignedLecturers.map((l) => l.id));
    setError("");
    setAssignSuccess("");
  }

  function toggleLecturer(lecturerId: string) {
    setSelectedLecturerIds((prev) =>
      prev.includes(lecturerId)
        ? prev.filter((id) => id !== lecturerId)
        : [...prev, lecturerId],
    );
  }

  async function handleAddSlot(courseId: string) {
    if (!activeDept || !uniId || !slotVenue.trim()) return;
    setSaving(true);
    try {
      if (slotStart >= slotEnd) throw new Error("End time must be after start time");
      const course = courses.find((c) => c.id === courseId);
      if (!course) throw new Error("Course not found");
      const assigned = course.assignedLecturers;
      if (assigned.length === 0) {
        throw new Error("Assign a lecturer to this course first");
      }
      const lecturerId = assigned[0].id;

      const { error: err } = await supabase.from("timetable").insert({
        course_id: courseId,
        lecturer_id: lecturerId,
        department_id: activeDept.id,
        university_id: uniId,
        venue: slotVenue.trim(),
        day_of_week: displayDayToDb(slotDay),
        start_time: slotStart,
        end_time: slotEnd,
        academic_session: academicCtx.academic_session,
        semester: course.semester,
        is_active: true,
      });
      if (err) throw new Error(err.message);
      setExpandedSlotCourseId(null);
      setSlotVenue("");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add slot");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    if (!confirm("Remove this timetable slot?")) return;
    await supabase.from("timetable").delete().eq("id", slotId);
    loadData();
  }

  function downloadCombinedTemplate() {
    const blob = new Blob([COMBINED_CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "combined_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCombinedCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeDept || !uniId) return;
    setImporting(true);
    setImportErrors([]);
    setImportSuccess(0);
    setImportSummary("");
    setSkippedLecturers([]);

    const text = await file.text();

    try {
      const res = await fetch("/api/timetable/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university_id: uniId,
          department_id: activeDept.id,
          csv_text: text,
          mode: "commit",
          auto_enroll: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");

      setImportSuccess(data.courses_upserted ?? 0);
      setImportSummary(
        `${data.courses_upserted ?? 0} course(s), ${data.offerings_upserted ?? 0} offering(s), ${data.slots_upserted ?? 0} slot(s) imported`
      );

      const skipped = data.skipped_lecturers ?? [];
      if (skipped.length > 0) {
        setSkippedLecturers(skipped);
      }

      if (data.courses_upserted > 0 || data.slots_upserted > 0) loadData();
    } catch (err: unknown) {
      setImportErrors([err instanceof Error ? err.message : "Import failed"]);
    } finally {
      setImporting(false);
    }
    e.target.value = "";
  }

  function courseSlots(courseId: string): TimetableSlot[] {
    return slotsByCourse[courseId] ?? [];
  }

  const slotFormOpen = (courseId: string) => expandedSlotCourseId === courseId;

  return (
    <div>
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
          <button
            onClick={() =>
              router.push(
                activeDept
                  ? `/u/departments?faculty=${facultyParam || activeDept.faculty}`
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
            {activeDept ? `${activeDept.name} Courses` : "Courses"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {courses.length} course{courses.length !== 1 ? "s" : ""} · manage courses, lecturers and schedule together
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={downloadCombinedTemplate}
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
          <label
            style={{
              cursor: importing || !activeDept ? "not-allowed" : "pointer",
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleCombinedCSVImport}
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
            onClick={() => {
              setNewLevel(activeLevel);
              setShowCreateModal(true);
              setError("");
            }}
            disabled={!activeDept}
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: activeDept ? 1 : 0.5,
            }}
          >
            <Plus size={15} /> Add Course
          </button>
        </div>
      </div>

      {assignSuccess && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
          }}
        >
          <UserCheck size={16} style={{ color: "#22c55e" }} />
          <p style={{ fontSize: "13px", color: "#22c55e" }}>{assignSuccess}</p>
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
            Failed to load courses: {fetchError}
          </p>
        </div>
      )}

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
          <div>
            <p style={{ fontSize: "13px", color: "var(--success)" }}>
              ✓ {importSummary}
            </p>
            {skippedLecturers.length > 0 && (
              <p style={{ fontSize: "12px", color: "var(--warning)", marginTop: "4px" }}>
                ⚠ {skippedLecturers.length} course{skippedLecturers.length !== 1 ? "s" : ""} without lecturer assignment
              </p>
            )}
          </div>
          <button
            onClick={() => { setImportSuccess(0); setImportSummary(""); setSkippedLecturers([]); }}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={14} style={{ color: "var(--success)" }} />
          </button>
        </div>
      )}

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
              {importErrors.length} error{importErrors.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setImportErrors([])}
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

      <div style={{ marginBottom: "16px" }}>
        <LevelTabs
          levels={levelTabs}
          activeLevel={activeLevel}
          onChange={(level) => setActiveLevel(level as CourseLevel)}
          counts={levelCounts}
        />
      </div>

      <div style={{ position: "relative", marginBottom: "20px" }}>
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
          placeholder="Search courses or lecturers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ width: "100%", paddingLeft: "38px", boxSizing: "border-box" }}
        />
      </div>

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
      ) : filteredCourses.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            border: "1px dashed var(--border-primary)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <BookOpen
            size={32}
            style={{ color: "var(--text-muted)", marginBottom: "12px" }}
          />
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            {search
              ? "No courses match your search."
              : `No ${activeLevel} level courses yet. Add one or switch level tabs.`}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ padding: "16px 16px 0 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {course.code}
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {course.title}
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {course.level}L · Sem {course.semester} · {course.credit_units} CU
                </span>
              </div>

              <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: "6px", borderBottom: "1px solid var(--border-primary)" }}>
                {course.assignedLecturers.length > 0 ? (
                  course.assignedLecturers.map((l) => (
                    <span
                      key={l.id}
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        padding: "4px 8px",
                        borderRadius: "4px",
                        background: "var(--brand-muted)",
                        border: "1px solid var(--border-brand)",
                        color: "var(--brand)",
                      }}
                    >
                      {l.full_name}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "11px", color: "var(--warning)" }}>
                    No lecturers assigned
                  </span>
                )}
                <button
                  onClick={() => openAssignModal(course)}
                  title="Assign lecturers"
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid var(--border-primary)",
                    background: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                >
                  + Assign
                </button>
              </div>

              <div style={{ padding: "12px 16px", flex: 1 }}>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "8px",
                  }}
                >
                  Schedule
                </p>
                {courseSlots(course.id).length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {courseSlots(course.id).map((slot) => (
                      <div
                        key={slot.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "12px",
                        }}
                      >
                        <span
                          style={{
                            padding: "3px 6px",
                            borderRadius: "4px",
                            background: "var(--brand-muted)",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: "var(--brand)",
                            minWidth: "36px",
                            textAlign: "center",
                          }}
                        >
                          {slot.day.slice(0, 3)}
                        </span>
                        <span style={{ fontWeight: 500, color: "var(--text-primary)", minWidth: "72px" }}>
                          {slot.start_time}–{slot.end_time}
                        </span>
                        <span style={{ color: "var(--text-secondary)", flex: 1 }}>
                          {slot.venue}
                        </span>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          title="Remove slot"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-muted)",
                            padding: "2px",
                            fontSize: "11px",
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                    No schedule slots yet
                  </p>
                )}

                {slotFormOpen(course.id) ? (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <select
                      value={slotDay}
                      onChange={(e) => setSlotDay(e.target.value)}
                      className="select"
                      style={{ fontSize: "12px", width: "100%" }}
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      <select
                        value={slotStart}
                        onChange={(e) => setSlotStart(e.target.value)}
                        className="select"
                        style={{ fontSize: "12px" }}
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <select
                        value={slotEnd}
                        onChange={(e) => setSlotEnd(e.target.value)}
                        className="select"
                        style={{ fontSize: "12px" }}
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={slotVenue}
                      onChange={(e) => setSlotVenue(e.target.value)}
                      placeholder="Venue (e.g., LT-101)"
                      className="input"
                      style={{ fontSize: "12px", width: "100%", boxSizing: "border-box" }}
                    />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => { setExpandedSlotCourseId(null); setSlotVenue(""); }}
                        className="btn-secondary"
                        style={{ flex: 1, fontSize: "11px" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={saving || !slotVenue.trim() || course.assignedLecturers.length === 0}
                        onClick={() => handleAddSlot(course.id)}
                        className="btn-primary"
                        style={{
                          flex: 1,
                          fontSize: "11px",
                          opacity: saving || !slotVenue.trim() || course.assignedLecturers.length === 0 ? 0.5 : 1,
                        }}
                      >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        setExpandedSlotCourseId(course.id);
                        setSlotDay("Monday");
                        setSlotStart("08:00");
                        setSlotEnd("10:00");
                        setSlotVenue("");
                        setError("");
                      }}
                      disabled={course.assignedLecturers.length === 0}
                      title={course.assignedLecturers.length === 0 ? "Assign lecturers first" : "Add schedule slot"}
                      style={{
                        fontSize: "11px",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-primary)",
                        background: "none",
                        cursor: course.assignedLecturers.length === 0 ? "not-allowed" : "pointer",
                        color: "var(--text-muted)",
                        opacity: course.assignedLecturers.length === 0 ? 0.5 : 1,
                      }}
                    >
                      + Add Slot
                    </button>
                    <div style={{ flex: 1 }} />
                      <button
                      onClick={() => setConfirmDelete(course)}
                      title="Delete course"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {skippedLecturers.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "360px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--warning)" }}>
              ⚠ Courses without lecturers
            </p>
            <button
              onClick={() => setSkippedLecturers([])}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={14} />
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
            These courses were created but no matching lecturer was found. Assign lecturers manually:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "200px", overflowY: "auto" }}>
            {skippedLecturers.map((s, i) => (
              <div
                key={i}
                style={{
                  fontSize: "12px",
                  padding: "6px 8px",
                  background: "var(--bg-secondary)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontFamily: "monospace",
                }}
              >
                {s.course_code} — {s.course_title}
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>
                  ({s.lecturer_email})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreateModal && (
        <Modal
          title="Add Course"
          onClose={() => {
            setShowCreateModal(false);
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
            <div>
              <label className="label" style={{ display: "block", marginBottom: "6px" }}>
                Course Code
              </label>
              <input
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="CSC301"
                className="input"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label className="label" style={{ display: "block", marginBottom: "6px" }}>
                Title
              </label>
              <input
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Data Structures"
                className="input"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label className="label" style={{ display: "block", marginBottom: "8px" }}>
                Level
              </label>
              <LevelTabs
                levels={levelTabs}
                activeLevel={newLevel}
                onChange={(level) => setNewLevel(level as CourseLevel)}
                size="sm"
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <label className="label" style={{ display: "block", marginBottom: "6px" }}>
                  Semester
                </label>
                <select
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value as "1" | "2")}
                  className="select"
                  style={{ width: "100%", boxSizing: "border-box" }}
                >
                  <option value="1">1st</option>
                  <option value="2">2nd</option>
                </select>
              </div>
              <div>
                <label className="label" style={{ display: "block", marginBottom: "6px" }}>
                  Credit Units
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  max={10}
                  value={newCreditUnits}
                  onChange={(e) => setNewCreditUnits(e.target.value)}
                  className="input"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div>
              <label className="label" style={{ display: "block", marginBottom: "6px" }}>
                Description (optional)
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="input"
                rows={3}
                style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : "Create Course"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {assignCourse && (
        <Modal
          title={`Assign Lecturers — ${assignCourse.code}`}
          onClose={() => {
            setAssignCourse(null);
            setSelectedLecturerIds([]);
            setError("");
          }}
          maxWidth="560px"
        >
          <form
            onSubmit={handleAssignLecturers}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {error && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  background: "var(--danger-muted)",
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
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Select one or more lecturers for {assignCourse.title}. Multiple
              lecturers can co-teach the same course.
            </p>
            <div
              style={{
                maxHeight: "280px",
                overflowY: "auto",
                border: "1px solid var(--border-primary)",
                borderRadius: "10px",
              }}
            >
              {facultyLecturers.length === 0 ? (
                <p
                  style={{
                    padding: "16px",
                    fontSize: "13px",
                    color: "var(--text-muted)",
                  }}
                >
                  No lecturers found.{" "}
                  <Link
                    href={`/u/lecturers?faculty=${facultyParam || activeDept?.faculty}`}
                    style={{ color: "var(--brand)" }}
                  >
                    Add lecturers first
                  </Link>
                </p>
              ) : (
                facultyLecturers.map((l) => {
                  const checked = selectedLecturerIds.includes(l.id);
                  return (
                    <label
                      key={l.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        borderBottom: "1px solid var(--border-primary)",
                        cursor: "pointer",
                        background: checked
                          ? "var(--brand-muted)"
                          : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLecturer(l.id)}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                          }}
                        >
                          {l.full_name}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {l.email}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {selectedLecturerIds.length} lecturer
              {selectedLecturerIds.length !== 1 ? "s" : ""} selected
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setAssignCourse(null)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Save Assignments"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmationModal
        visible={!!confirmDelete}
        title="Delete Course"
        message={
          confirmDelete
            ? `Delete ${confirmDelete.code} — ${confirmDelete.title}? This will permanently remove the course, all timetable slots, and lecturer assignments.`
            : ""
        }
        confirmText="Delete"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        isDestructive
      />
    </div>
  );
}
