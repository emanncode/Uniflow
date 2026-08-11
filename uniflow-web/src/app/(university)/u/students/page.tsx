"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUniversity } from "@/context/UniversityContext";
import { staffApiUrl } from "@/lib/staff-api";

import {
  GraduationCap,
  Plus,
  Search,
  X,
  Loader2,
  Trash2,
  Mail,
  User,
  Building,
  ChevronDown,
  AlertCircle,
  Key,

  AlertTriangle,
  Edit2,
  ArrowLeft
} from "lucide-react";
import { validateAndNormalizeEmail } from "@/lib/email";
import {
  type CourseLevel,
  type MaxCourseLevel,
  getCourseLevels,
  isValidCourseLevel,
  parseCourseLevel,
  formatLevelTab,
} from "@/lib/course-levels";

interface Student {
  id: string
  full_name: string
  email: string
  role: string
  department_id: string | null
  department_name: string | null
  level: number | null
  status: string
  created_at: string
}

interface Department {
  id: string
  name: string
  short_name: string
  faculty: string
  max_course_level: MaxCourseLevel | null
}

interface Faculty {
  id: string
  name: string
  short_name: string
}

import Modal from "@/components/ui/Modal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const STATUS_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  active: {
    bg: "var(--success-muted)",
    border: "rgba(34, 197, 94, 0.2)",
    text: "var(--success)",
  },
  pending: {
    bg: "var(--warning-muted)",
    border: "rgba(245, 158, 11, 0.2)",
    text: "var(--warning)",
  },
  inactive: {
    bg: "var(--status-ended-muted)",
    border: "rgba(113, 113, 122, 0.2)",
    text: "var(--status-ended)",
  },
};

function StudentRow({
  student,
  departments,
  onDelete,
  onResetPassword,
  onUpdate,
  hideDepartment = false,
}: {
  student: Student;
  departments: Department[];
  onDelete: (id: string) => void;
  onResetPassword: (student: Student) => void;
  onUpdate: (id: string, updates: Partial<Student>) => Promise<void>;
  hideDepartment?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student.full_name);
  const [editEmail, setEditEmail] = useState(student.email);
  const [editDeptId, setEditDeptId] = useState(student.department_id || "");
  const [saving, setSaving] = useState(false);

  const s = STATUS_COLORS[student.status] ?? STATUS_COLORS.pending;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(student.id, {
        full_name: editName,
        email: editEmail,
        department_id: editDeptId || null,
      });
      setIsEditing(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update student";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: hideDepartment ? "2fr 100px 120px 80px" : "2fr 1fr 120px 80px",
        alignItems: "center",
        gap: "16px",
        padding: "10px 16px",
        borderBottom: "1px solid var(--border-primary)",
        transition: "all var(--transition)",
      }}
      onMouseEnter={(e) =>
        !isEditing && ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")
      }
      onMouseLeave={(e) =>
        !isEditing && ((e.currentTarget as HTMLElement).style.background = "transparent")
      }
    >
      {/* Name + Email */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '4px' }} disabled={saving} />
            <input className="input" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ padding: '4px' }} disabled={saving} />
          </div>
        ) : (
          <>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-secondary)" }}>
                {(student.full_name || "S").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {student.full_name}
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {student.email}
              </p>
            </div>
          </>
        )}
      </div>

      {hideDepartment && !isEditing && (
        <div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "4px",
              padding: "2px 6px",
              fontFamily: "monospace",
            }}
          >
            {student.level ? `${student.level}L` : "—"}
          </span>
        </div>
      )}

      {/* Department */}
      {!hideDepartment && (
      <div>
        {isEditing ? (
          <select className="select" value={editDeptId} onChange={(e) => setEditDeptId(e.target.value)} style={{ padding: '4px', width: '100%' }} disabled={saving}>
            <option value="">No department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Building
              size={11}
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
            />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {student.department_name ?? "—"}
            </span>
          </div>
        )}
      </div>
      )}

      {/* Status */}
      <div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 500,
            color: s.text,
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: "4px",
            padding: "2px 6px",
            display: "inline-block",
            textTransform: "uppercase",
            letterSpacing: "0.03em",
          }}
        >
          {student.status}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        {isEditing ? (
          <>
            <button onClick={handleSave} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)" }} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
            </button>
            <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} disabled={saving}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--text-muted)" }} title="Edit"><Edit2 size={13} /></button>
            <button
              onClick={() => onResetPassword(student)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "4px", color: "var(--text-muted)", transition: "color 0.2s"
              }}
              title="Reset Password"
            >
              <Key size={13} />
            </button>
            <button
              onClick={() => onDelete(student.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "var(--text-muted)",
                transition: "color 0.2s",
              }}
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const { universityId: contextUniId, isReady } = useUniversity();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterFaculty, setFilterFaculty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(0);
  const [error, setError] = useState("");
  const [uniId, setUniId] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<CourseLevel>(100);
  const [showLevelSetup, setShowLevelSetup] = useState(false);
  const [savingSetup, setSavingSetup] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const deptParam = searchParams.get("department");

  // Support direct links from Departments page: ?department=CODE&faculty=CODE
  useEffect(() => {
    if (departments.length === 0) return;

    const deptParam = searchParams.get("department");
    const facParam = searchParams.get("faculty");

    if (facParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilterFaculty(facParam);
    }

    if (deptParam) {
      // Find the department ID from the short name if necessary
      const dept = departments.find(d => d.short_name === deptParam || d.id === deptParam);
      if (dept) {
        setFilterDept(dept.id);
      } else {
        setFilterDept(deptParam);
      }
    }
  }, [searchParams, departments]);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDeptId, setNewDeptId] = useState("");

  const [confirmReset, setConfirmReset] = useState<Student | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const activeDept = useMemo(() => {
    if (!filterDept) return null;
    return departments.find((d) => d.id === filterDept) ?? null;
  }, [filterDept, departments]);

  const isDeptScoped = Boolean(deptParam && activeDept);
  const departmentConfigured = activeDept?.max_course_level != null;
  const maxCourseLevel = (activeDept?.max_course_level ?? 400) as MaxCourseLevel;
  const levelTabs = useMemo(
    () => getCourseLevels(maxCourseLevel),
    [maxCourseLevel],
  );

  const deptStudents = useMemo(() => {
    if (!filterDept) return students;
    return students.filter((s) => s.department_id === filterDept);
  }, [students, filterDept]);

  const levelCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const level of levelTabs) counts[level] = 0;
    for (const student of deptStudents) {
      if (student.level && counts[student.level] !== undefined) {
        counts[student.level]++;
      }
    }
    return counts;
  }, [deptStudents, levelTabs]);

  useEffect(() => {
    if (!levelTabs.includes(activeLevel)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveLevel((levelTabs[0] ?? 100) as CourseLevel);
    }
  }, [levelTabs, activeLevel]);

  useEffect(() => {
    if (isDeptScoped && activeDept && !departmentConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowLevelSetup(true);
    }
  }, [isDeptScoped, activeDept, departmentConfigured]);

  const CSV_TEMPLATE = `full_name,email,level,department_short_name\nJohn Doe,john@uni.edu,100,CSC\nJane Smith,jane@uni.edu,200,CSC\nMike Ade,mike@uni.edu,300,MTH`;

  function validateEmail(email: string) {
    const result = validateAndNormalizeEmail(email);
    if (result.valid && result.wasCorrected) {
      // If it was corrected, we treat it as an error to force the user to fix the typo
      return {
        ...result,
        valid: false,
        error: `It looks like the email domain is misspelled (found "@${result.original.split('@')[1]}"). Did you mean "@${result.normalized.split('@')[1]}"?`
      };
    }
    return result;
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uniId) return;
    setImporting(true);
    setImportErrors([]);
    setImportSuccess(0);

    try {
      const text = await file.text();
      const lines = text.trim().split("\n").filter(l => l.trim());
      if (lines.length < 2) throw new Error("CSV is empty or missing data rows");

      const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
      const rows = lines.slice(1);

      const errors: string[] = [];
      let successCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const vals = rows[i].split(",").map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] ?? ""; });
        const lineNum = i + 2;

        if (!row.full_name || !row.email) {
          errors.push(`Row ${lineNum}: Missing full_name or email`);
          continue;
        }

        const emailResult = validateEmail(row.email);
        if (!emailResult.valid) {
          errors.push(`Row ${lineNum}: ${emailResult.error} "${row.email}"`);
          continue;
        }

        const dept = isDeptScoped
          ? activeDept
          : departments.find(
              (d) =>
                d.short_name.toLowerCase() ===
                row.department_short_name?.toLowerCase(),
            );

        const level = parseCourseLevel(row.level || "");
        if (!level) {
          errors.push(`Row ${lineNum}: Invalid level "${row.level}"`);
          continue;
        }
        const deptMax = (dept?.max_course_level ?? 400) as MaxCourseLevel;
        if (!isValidCourseLevel(level, deptMax)) {
          errors.push(
            `Row ${lineNum}: Level ${level} is not allowed for ${dept?.name ?? "this department"}`,
          );
          continue;
        }
        if (!dept?.max_course_level) {
          errors.push(
            `Row ${lineNum}: Department "${row.department_short_name}" has not been set up with levels yet`,
          );
          continue;
        }

        try {
          const res = await fetch('/api/create-staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: row.full_name,
              email: emailResult.normalized,
              role: 'student',
              department_id: dept?.id || null,
              university_id: uniId,
              level,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          successCount++;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "unknown error";
          errors.push(`Row ${lineNum}: ${message}`);
        }
      }

      setImportErrors(errors);
      setImportSuccess(successCount);
      if (successCount > 0 && contextUniId) await loadData(contextUniId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "CSV import failed";
      setImportErrors([message]);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  const loadData = useCallback(async (currentUniId: string) => {
    setLoading(true);
    setUniId(currentUniId);

    try {
      const [facRes, deptRes, staffRes] = await Promise.all([
        supabase
          .from("faculties")
          .select("id, name, short_name")
          .eq("university_id", currentUniId)
          .order("name"),
        supabase
          .from("departments")
          .select("id, name, short_name, faculty, max_course_level")
          .eq("university_id", currentUniId)
          .order("name"),
        fetch(staffApiUrl(currentUniId, { roles: ["student"] })),
      ]);
      const facData = facRes.data;
      const deptData = deptRes.data;
      setFaculties(facData ?? []);

      const deptMap: Record<string, string> = {};
      (deptData ?? []).forEach((d) => {
        deptMap[d.id] = d.name;
      });
      setDepartments(deptData ?? []);

      const { data: allProfiles } = await staffRes.json()
      const studentsData = allProfiles || [];

      setStudents(
        studentsData.map((l: { id: string; full_name: string; email: string; role: string; department_id: string | null; level: number | null; status: string; created_at: string }) => ({
          id: l.id,
          full_name: l.full_name,
          email: l.email,
          role: l.role,
          department_id: l.department_id,
          department_name: l.department_id
            ? (deptMap[l.department_id] ?? null)
            : null,
          level: l.level ?? null,
          status: l.status ?? "pending",
          created_at: l.created_at,
        })),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error("StudentsPage: Data loading failed:", message);
      setError("Failed to load student list: " + message);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isReady || !contextUniId) return;
    loadData(contextUniId);
  }, [isReady, contextUniId, loadData]);

  async function handleDepartmentSetup(maxLevel: MaxCourseLevel) {
    if (!activeDept) return;
    setSavingSetup(true);
    setError("");
    try {
      const { error: updateError } = await supabase
        .from("departments")
        .update({ max_course_level: maxLevel })
        .eq("id", activeDept.id);
      if (updateError) throw new Error(updateError.message);
      setShowLevelSetup(false);
      if (contextUniId) await loadData(contextUniId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save department setup");
    } finally {
      setSavingSetup(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (isDeptScoped && !departmentConfigured) {
      setError("Complete department level setup first.");
      return;
    }

    const emailResult = validateEmail(newEmail);
    if (!emailResult.valid) {
        setError(emailResult.error || "Invalid email format.");
        return;
    }

    const targetDeptId = isDeptScoped ? activeDept!.id : (newDeptId || null);
    if (!targetDeptId) {
      setError("Select a department for this student.");
      return;
    }

    setSaving(true)
    try {
      if (!uniId) throw new Error("University ID not found.");
      
      const res = await fetch('/api/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newName.trim(),
          email: emailResult.normalized,
          role: 'student',
          department_id: targetDeptId,
          university_id: uniId,
          level: isDeptScoped || filterDept ? activeLevel : activeLevel,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setNewName(''); setNewEmail(''); setNewDeptId('');
      setShowModal(false)
      alert(
        data.emailSent === false
          ? `Success! ${newName} has been added, but the password reset email could not be sent. Ask your admin to resend a reset link.`
          : `Success! ${newName} has been added. A password reset link was sent to ${data.email || emailResult.normalized}.`,
      )
      if (contextUniId) await loadData(contextUniId)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add student";
      setError(message);
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async (student: Student) => {
    setConfirmReset(null)
    setSaving(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: student.email })
      })

      const data = await res.json()
      if (data.success) {
        alert(`Password reset for ${student.full_name}. They should now use the "Forgot Password" tool on the login page to get a new temporary password.`)
      } else {
        alert(data.error || 'Failed to reset password')
      }
    } catch {
      alert('An error occurred while resetting password')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(null);
    setSaving(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (contextUniId) await loadData(contextUniId);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to remove student";
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, updates: Partial<Student>) {
    if (updates.email) {
      const result = validateAndNormalizeEmail(updates.email);
      if (!result.valid) throw new Error(result.error);
      updates.email = result.normalized;
    }

    const res = await fetch('/api/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    if (contextUniId) await loadData(contextUniId);
  }

  const filtered = useMemo(() => {
    return students.filter((l) => {
      const matchSearch =
        (l.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (l.email || "").toLowerCase().includes(search.toLowerCase());
      
      const dept = departments.find(d => d.id === l.department_id);
      const matchDept = !filterDept || l.department_id === filterDept;
      const matchFac = !filterFaculty || (dept && dept.faculty === filterFaculty);
      const matchStatus = !filterStatus || l.status === filterStatus;
      const matchLevel =
        !isDeptScoped || !departmentConfigured
          ? true
          : l.level === activeLevel;
      
      return matchSearch && matchDept && matchFac && matchStatus && matchLevel;
    });
  }, [students, search, filterFaculty, filterDept, filterStatus, departments, isDeptScoped, departmentConfigured, activeLevel]);

  const counts = useMemo(() => ({
    total: filtered.length,
    active: filtered.filter((l) => l.status === "active").length,
    pending: filtered.filter((l) => l.status === "pending").length,
  }), [filtered]);

  return (
    <>
      <ConfirmationModal
        visible={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        onConfirm={() => confirmReset && handleResetPassword(confirmReset)}
        title="Reset Password?"
        message={`Are you sure you want to reset the password for ${confirmReset?.full_name}? A new temporary password will be generated immediately.`}
        confirmText="Yes, Reset"
        isDestructive
        isLoading={saving}
        icon={AlertTriangle}
      />

      <ConfirmationModal
        visible={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Remove Student?"
        message="Are you sure you want to remove this student? This will delete their account and access to the portal."
        confirmText="Yes, Remove"
        isDestructive
        isLoading={saving}
        icon={Trash2}
      />

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
            {/* Back button */}
            <button
              onClick={() => router.back()}
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
              {isDeptScoped && activeDept
                ? `${activeDept.name} Students`
                : "Students"}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {isDeptScoped && departmentConfigured
                ? `${counts.total} students in ${activeLevel} Level`
                : `${counts.total} total students · Manage and onboard`}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
            <button
              onClick={downloadTemplate}
              className="btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
            >
              ↓ CSV Template
            </button>
            <label
              style={{
                cursor:
                  importing || (isDeptScoped && !departmentConfigured)
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                style={{ display: "none" }}
                disabled={importing || (isDeptScoped && !departmentConfigured)}
              />
              <span
                className="btn-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                cursor:
                  importing || (isDeptScoped && !departmentConfigured)
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  importing || (isDeptScoped && !departmentConfigured)
                    ? 0.6
                    : 1,
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
                if (isDeptScoped) setNewDeptId(activeDept!.id);
                setShowModal(true);
              }}
              disabled={isDeptScoped && !departmentConfigured}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <Plus size={15} /> Add Student
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
              ✓ {importSuccess} student{importSuccess !== 1 ? "s" : ""} imported successfully
            </p>
            <button
              onClick={() => setImportSuccess(0)}
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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--danger)" }}>
                {importSuccess > 0 ? `${importSuccess} imported, ` : ""}
                {importErrors.length} error{importErrors.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => {
                  setImportErrors([]);
                  setImportSuccess(0);
                }}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={14} style={{ color: "var(--danger)" }} />
              </button>
            </div>
            {importErrors.map((err, i) => (
              <p key={i} style={{ fontSize: "12px", color: "var(--danger)", lineHeight: 1.6 }}>
                • {err}
              </p>
            ))}
          </div>
        )}

        {isDeptScoped && departmentConfigured && (
          <div style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
            <select
              value={activeLevel}
              onChange={(e) => setActiveLevel(Number(e.target.value) as CourseLevel)}
              className="input"
              style={{ width: "auto", minWidth: "140px" }}
            >
              {levelTabs.map((level) => (
                <option key={level} value={level}>
                  {formatLevelTab(level)} ({levelCounts[level] ?? 0})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filters */}
        {!isDeptScoped && (
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
              placeholder="Search students..."
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
          <div style={{ position: "relative" }}>
            <select
              value={filterFaculty}
              onChange={(e) => {
                setFilterFaculty(e.target.value);
                setFilterDept(""); // Reset department when faculty changes
              }}
              className="select"
              style={{ paddingRight: "32px", minWidth: "160px" }}
            >
              <option value="">All Faculties</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.short_name}>
                  {f.name}
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
          <div style={{ position: "relative" }}>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="select"
              style={{ paddingRight: "32px", minWidth: "160px" }}
            >
              <option value="">All Departments</option>
              {departments
                .filter(d => !filterFaculty || d.faculty === filterFaculty)
                .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
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
          <div style={{ position: "relative" }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select"
              style={{ paddingRight: "32px" }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
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
        )}

        {/* Table */}
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
              gridTemplateColumns: isDeptScoped
                ? "2fr 100px 120px 80px"
                : "2fr 1fr 120px 80px",
              gap: "16px",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-primary)",
              background: "var(--bg-secondary)",
            }}
          >
            {(isDeptScoped
              ? ["Student", "Level", "Status", ""]
              : ["Student", "Department", "Status", ""]
            ).map((h) => (
              <span
                key={h}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "60px",
              }}
            >
              <Loader2
                size={24}
                className="animate-spin"
                style={{ color: "var(--brand)" }}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <GraduationCap
                size={32}
                style={{ color: "var(--text-muted)", marginBottom: "12px" }}
              />
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {isDeptScoped && departmentConfigured
                  ? `No ${activeLevel} level students yet. Add or import students for this level.`
                  : search || filterDept || filterStatus
                    ? "No students match your filters."
                    : "No students yet. Add or upload a CSV to get started."}
              </p>
            </div>
          ) : (
            filtered.map((l) => (
              <StudentRow
                key={l.id}
                student={l}
                departments={departments}
                hideDepartment={isDeptScoped}
                onDelete={setConfirmDeleteId}
                onResetPassword={setConfirmReset}
                onUpdate={handleUpdate}
              />
            ))
          )}
        </div>

        {/* Add Modal */}
        {showLevelSetup && activeDept && (
          <Modal
            title={`Set up ${activeDept.name}`}
            onClose={() => router.push("/u/departments")}
            maxWidth="480px"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Before adding students to <strong>{activeDept.name}</strong>, choose
                the highest level this department uses. This is saved once and
                won&apos;t be asked again.
              </p>
              {error && (
                <p style={{ fontSize: "12px", color: "var(--danger)" }}>{error}</p>
              )}
              <button
                type="button"
                disabled={savingSetup}
                onClick={() => handleDepartmentSetup(400)}
                className="btn-secondary"
                style={{ padding: "14px", textAlign: "left" }}
              >
                <strong>100 – 400 Level</strong>
                <span style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Undergraduate only
                </span>
              </button>
              <button
                type="button"
                disabled={savingSetup}
                onClick={() => handleDepartmentSetup(500)}
                className="btn-primary"
                style={{ padding: "14px", textAlign: "left" }}
              >
                <strong>100 – 500 Level</strong>
                <span style={{ display: "block", fontSize: "12px", opacity: 0.85, marginTop: "4px" }}>
                  Includes postgraduate (500 level)
                </span>
              </button>
            </div>
          </Modal>
        )}

        {showModal && (
          <Modal
            title={
              isDeptScoped
                ? `Add ${activeLevel} Level Student`
                : "Add Student"
            }
            onClose={() => {
              setShowModal(false);
              setError("");
            }}
          >
            <form
              onSubmit={handleCreate}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {error && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    background: "var(--danger-muted)",
                    border: "1px solid var(--danger-muted)",
                    borderRadius: "var(--radius-md)",
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
                <label
                  className="label"
                  style={{ display: "block", marginBottom: "8px" }}
                >
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={14}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                    }}
                  />
                  <input
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="John Doe"
                    className="input"
                    style={{
                      width: "100%",
                      paddingLeft: "36px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
              <div>
                <label
                  className="label"
                  style={{ display: "block", marginBottom: "8px" }}
                >
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={14}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                    }}
                  />
                  <input
                    required
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="input"
                    style={{
                      width: "100%",
                      paddingLeft: "36px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
              {isDeptScoped ? (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Adding to <strong>{activeDept?.name}</strong> ·{" "}
                  <strong>{activeLevel} Level</strong>
                </p>
              ) : (
                <>
                  <div>
                    <label
                      className="label"
                      style={{ display: "block", marginBottom: "6px" }}
                    >
                      Level
                    </label>
                    <select
                      value={activeLevel}
                      onChange={(e) =>
                        setActiveLevel(Number(e.target.value) as CourseLevel)
                      }
                      className="select"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    >
                      {levelTabs.map((level) => (
                        <option key={level} value={level}>
                          {formatLevelTab(level)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="label"
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      Department
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        required
                        value={newDeptId}
                        onChange={(e) => setNewDeptId(e.target.value)}
                        className="select"
                        style={{
                          width: "100%",
                          paddingRight: "32px",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="" disabled>
                          Select department...
                        </option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
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
                </>
              )}
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
                  disabled={saving}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Add Student"
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  );
}
