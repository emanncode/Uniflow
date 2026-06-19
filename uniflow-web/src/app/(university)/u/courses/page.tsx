"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentAcademicSession } from "@/lib/academic";
import {
  syncLecturerCourseAssignments,
  upsertLecturerCourseAssignment,
} from "@/lib/lecturer-courses";
import { validateAndNormalizeEmail } from "@/lib/email";
import {
  type CourseLevel,
  type MaxCourseLevel,
  getCourseLevels,
  isValidCourseLevel,
  parseCourseLevel,
} from "@/lib/course-levels";
import LevelTabs from "@/components/ui/LevelTabs";
import {
  BookOpen,
  Plus,
  Search,
  Loader2,
  Trash2,
  ArrowLeft,
  AlertCircle,
  UserCheck,
  X,
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

export default function CoursesPage() {
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
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(0);
  const [importCorrected, setImportCorrected] = useState(0);

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const deptParam = searchParams.get("department");
  const facultyParam = searchParams.get("faculty");

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

      const [courseRes, staffRes, facRes, deptFullRes] = await Promise.all([
        supabase
          .from("courses")
          .select(
            "id, title, code, level, semester, credit_units, description, is_active",
          )
          .eq("university_id", profile.university_id)
          .eq("department_id", departmentId)
          .order("code"),
        fetch(`/api/staff?university_id=${profile.university_id}`),
        supabase
          .from("faculties")
          .select("id, short_name, dean_id")
          .eq("university_id", profile.university_id),
        supabase
          .from("departments")
          .select("id, faculty, hod_id")
          .eq("university_id", profile.university_id),
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
        const { data: assignments, error: assignError } = await supabase
          .from("lecturer_courses")
          .select("course_id, lecturer_id, profiles(id, full_name)")
          .in("course_id", courseIds)
          .eq("academic_session", sessionYear)
          .eq("is_active", true);

        if (assignError) {
          setFetchError(assignError.message);
        } else {
          for (const row of assignments ?? []) {
            const profile = row.profiles as
              | { id: string; full_name: string }
              | { id: string; full_name: string }[]
              | null;
            const lecturer = Array.isArray(profile) ? profile[0] : profile;
            if (!lecturer) continue;
            if (!assignmentMap[row.course_id]) assignmentMap[row.course_id] = [];
            assignmentMap[row.course_id].push({
              id: lecturer.id,
              full_name: lecturer.full_name,
            });
          }
        }
      }

      setCourses(
        courseList.map((c) => ({
          ...c,
          semester: c.semester as 1 | 2,
          assignedLecturers: assignmentMap[c.id] ?? [],
        })),
      );

      const staffData = await staffRes.json();
      const allProfiles = staffRes.ok ? (staffData.data ?? []) : [];
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

      const lecRoles = ["lecturer", "dean", "hod"];
      const mappedLecturers: Lecturer[] = allProfiles
        .filter((p: { role: string }) =>
          lecRoles.includes((p.role || "").toLowerCase().trim()),
        )
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

    void fetchPageData();

    return () => {
      cancelled = true;
    };
  }, [deptParam, refreshKey]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!activeDept || !uniId) return;
    setError("");
    setSaving(true);
    try {
      const { error: insertError } = await supabase.from("courses").insert({
        department_id: activeDept.id,
        university_id: uniId,
        title: newTitle.trim(),
        code: newCode.trim().toUpperCase(),
        level: newLevel,
        semester: parseInt(newSemester, 10) as 1 | 2,
        credit_units: parseInt(newCreditUnits, 10),
        description: newDescription.trim() || null,
        is_active: true,
      });
      if (insertError) throw new Error(insertError.message);

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
    if (!assignCourse || !uniId) return;
    setError("");
    setSaving(true);
    try {
      await syncLecturerCourseAssignments({
        courseId: assignCourse.id,
        universityId: uniId,
        semester: assignCourse.semester,
        lecturerIds: selectedLecturerIds,
      });
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

  async function handleDeactivate(course: CourseRow) {
    const { error: updateError } = await supabase
      .from("courses")
      .update({ is_active: false })
      .eq("id", course.id);
    if (updateError) {
      alert(updateError.message);
      return;
    }
    setConfirmDelete(null);
    loadData();
  }

  function openAssignModal(course: CourseRow) {
    setAssignCourse(course);
    setSelectedLecturerIds(course.assignedLecturers.map((l) => l.id));
    setError("");
  }

  function toggleLecturer(lecturerId: string) {
    setSelectedLecturerIds((prev) =>
      prev.includes(lecturerId)
        ? prev.filter((id) => id !== lecturerId)
        : [...prev, lecturerId],
    );
  }

  const CSV_TEMPLATE = `code,title,level,semester,credit_units,description,lecturer_emails
CSC301,Data Structures,300,1,3,Introduction to data structures,lecturer@email.com
MTH201,Calculus II,200,2,4,,john@email.com;jane@email.com`;

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "courses_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function resolveLecturerIds(
    emailsRaw: string,
    lineNum: number,
    errors: string[],
    correctedCount: { value: number },
  ): Promise<string[]> {
    const emails = emailsRaw
      .split(";")
      .map((e) => e.trim())
      .filter(Boolean);
    if (emails.length === 0) return [];

    const ids: string[] = [];
    for (const rawEmail of emails) {
      const emailCheck = validateAndNormalizeEmail(rawEmail);
      if (!emailCheck.valid) {
        errors.push(`Row ${lineNum}: Invalid lecturer email "${rawEmail}"`);
        continue;
      }
      if (emailCheck.wasCorrected) correctedCount.value++;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", emailCheck.normalized)
        .eq("university_id", uniId)
        .single();

      if (!profile) {
        errors.push(
          `Row ${lineNum}: Lecturer "${emailCheck.normalized}" not found`,
        );
        continue;
      }
      ids.push(profile.id);
    }
    return ids;
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeDept || !uniId) return;

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
    const correctedCount = { value: 0 };

    const existingByCode = new Map(
      courses.map((c) => [c.code.toLowerCase(), c]),
    );

    for (let i = 0; i < rows.length; i++) {
      const vals = rows[i].split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = vals[idx] ?? "";
      });
      const lineNum = i + 2;

      const code = row.code?.trim();
      const title = row.title?.trim();
      if (!code) {
        errors.push(`Row ${lineNum}: Missing course code`);
        continue;
      }
      if (!title) {
        errors.push(`Row ${lineNum}: Missing title`);
        continue;
      }

      const level = parseCourseLevel(row.level || "");
      const semester = parseInt(row.semester || "", 10);
      const creditUnits = parseInt(row.credit_units || "", 10);

      if (!level) {
        errors.push(
          `Row ${lineNum}: Invalid level "${row.level}" — use 100, 200, 300, 400${maxCourseLevel === 500 ? ", or 500" : ""}`,
        );
        continue;
      }
      if (!isValidCourseLevel(level, maxCourseLevel)) {
        errors.push(
          `Row ${lineNum}: Level ${level} is not enabled — set up this department via Students to allow 500 level`,
        );
        continue;
      }
      if (semester !== 1 && semester !== 2) {
        errors.push(
          `Row ${lineNum}: Invalid semester "${row.semester}" — must be 1 or 2`,
        );
        continue;
      }
      if (!creditUnits || creditUnits < 1 || creditUnits > 10) {
        errors.push(
          `Row ${lineNum}: Invalid credit_units "${row.credit_units}" — must be 1–10`,
        );
        continue;
      }

      let courseId: string;
      let courseSemester = semester as 1 | 2;
      const existing = existingByCode.get(code.toLowerCase());

      if (existing) {
        courseId = existing.id;
        courseSemester = existing.semester;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("courses")
          .insert({
            department_id: activeDept.id,
            university_id: uniId,
            title,
            code: code.toUpperCase(),
            level,
            semester: courseSemester,
            credit_units: creditUnits,
            description: row.description?.trim() || null,
            is_active: true,
          })
          .select("id, code, semester")
          .single();

        if (insertError || !inserted) {
          errors.push(
            `Row ${lineNum}: ${insertError?.message ?? "Failed to create course"}`,
          );
          continue;
        }

        courseId = inserted.id;
        existingByCode.set(code.toLowerCase(), {
          id: inserted.id,
          title,
          code: inserted.code,
          level,
          semester: inserted.semester as 1 | 2,
          credit_units: creditUnits,
          description: row.description?.trim() || null,
          is_active: true,
          assignedLecturers: [],
        });
      }

      const lecturerIds = await resolveLecturerIds(
        row.lecturer_emails || "",
        lineNum,
        errors,
        correctedCount,
      );

      if (lecturerIds.length > 0) {
        for (const lecturerId of lecturerIds) {
          try {
            await upsertLecturerCourseAssignment({
              lecturerId,
              courseId,
              universityId: uniId,
              semester: courseSemester,
            });
          } catch (err: unknown) {
            errors.push(
              `Row ${lineNum}: ${err instanceof Error ? err.message : "Failed to assign lecturer"}`,
            );
          }
        }
      }

      successCount++;
    }

    setImportErrors(errors);
    setImportSuccess(successCount);
    setImportCorrected(correctedCount.value);
    if (successCount > 0) loadData();
    setImporting(false);
    e.target.value = "";
  }

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
            {courses.length} course{courses.length !== 1 ? "s" : ""} · assign
            lecturers before building the timetable
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {activeDept && (
            <Link
              href={`/u/timetable?department=${activeDept.id}&faculty=${facultyParam || activeDept.faculty}`}
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              Timetable
            </Link>
          )}
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
          <label
            style={{
              cursor: importing || !activeDept ? "not-allowed" : "pointer",
            }}
          >
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
          <p style={{ fontSize: "13px", color: "var(--success)" }}>
            ✓ {importSuccess} course{importSuccess !== 1 ? "s" : ""} imported
            successfully
            {importCorrected > 0
              ? ` (${importCorrected} lecturer email domain${importCorrected !== 1 ? "s" : ""} auto-corrected)`
              : ""}
          </p>
          <button
            onClick={() => {
              setImportSuccess(0);
              setImportCorrected(0);
            }}
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
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 2fr 1fr 1.5fr 100px",
              gap: "12px",
              padding: "10px 16px",
              borderBottom: "1px solid var(--border-primary)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span>Code</span>
            <span>Title</span>
            <span>Level / Sem</span>
            <span>Lecturers</span>
            <span />
          </div>
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 2fr 1fr 1.5fr 100px",
                gap: "12px",
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-primary)",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {course.code}
              </span>
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  {course.title}
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {course.credit_units} credit units
                </p>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {course.level}00L · Sem {course.semester}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {course.assignedLecturers.length > 0 ? (
                  course.assignedLecturers.map((l) => (
                    <span
                      key={l.id}
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-secondary)",
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
              </div>
              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => openAssignModal(course)}
                  title="Assign lecturers"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    color: "var(--text-muted)",
                  }}
                >
                  <UserCheck size={14} />
                </button>
                <button
                  onClick={() => setConfirmDelete(course)}
                  title="Deactivate course"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    color: "var(--text-muted)",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
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
        title="Deactivate Course"
        message={
          confirmDelete
            ? `Deactivate ${confirmDelete.code} — ${confirmDelete.title}? Existing timetable slots may need manual cleanup.`
            : ""
        }
        confirmText="Deactivate"
        onConfirm={() => confirmDelete && handleDeactivate(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        isDestructive
      />
    </div>
  );
}