"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Search,
  X,
  Loader2,
  Trash2,
  Mail,
  User,
  Building2,
  ChevronDown,
  AlertCircle,
  Key,
  Copy,
  Check,
  AlertTriangle
} from "lucide-react";

interface Student {
  id: string
  full_name: string
  email: string
  role: string
  department_id: string | null
  department_name: string | null
  status: string
  created_at: string
}

interface Department {
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
  onDelete,
  onResetPassword,
}: {
  student: Student;
  onDelete: (id: string) => void;
  onResetPassword: (student: Student) => void;
}) {
  const s = STATUS_COLORS[student.status] ?? STATUS_COLORS.pending;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 120px 80px",
        alignItems: "center",
        gap: "16px",
        padding: "10px 16px",
        borderBottom: "1px solid var(--border-primary)",
        transition: "all var(--transition)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "transparent")
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <Building2
          size={11}
          style={{ color: "var(--text-muted)", flexShrink: 0 }}
        />
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          {student.department_name ?? "—"}
        </span>
      </div>

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

      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
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
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(0);
  const [error, setError] = useState("");
  const [uniId, setUniId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDeptId, setNewDeptId] = useState("");

  const [confirmReset, setConfirmReset] = useState<Student | null>(null)

  const CSV_TEMPLATE = `full_name,email,department_short_name\nJohn Doe,john@uni.edu,CSC\nJane Smith,jane@uni.edu,FOA\nMike Ade,mike@uni.edu,MTH`;

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

        const dept = departments.find(d => d.short_name.toLowerCase() === row.department_short_name?.toLowerCase());
        
        try {
          const res = await fetch('/api/create-staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: row.full_name,
              email: row.email.toLowerCase(),
              role: 'student',
              department_id: dept?.id || null,
              university_id: uniId,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          successCount++;
        } catch (err: any) {
          errors.push(`Row ${lineNum}: ${err.message}`);
        }
      }

      setImportErrors(errors);
      setImportSuccess(successCount);
      if (successCount > 0) await loadData();
    } catch (err: any) {
      setImportErrors([err.message]);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("university_id")
      .eq("id", session.user.id)
      .single();
    if (!profile) return;
    setUniId(profile.university_id);

    try {
      const { data: deptData } = await supabase
          .from("departments")
          .select("id, name, short_name")
          .eq("university_id", profile.university_id)
          .order("name");

      const deptMap: Record<string, string> = {};
      (deptData ?? []).forEach((d) => {
        deptMap[d.id] = d.name;
      });
      setDepartments(deptData ?? []);

      const staffRes = await fetch(`/api/staff?university_id=${profile.university_id}`)
      const { data: allProfiles } = await staffRes.json()

      const studentsData = (allProfiles || []).filter((p: { role: string }) => (p.role || "").toLowerCase().trim() === "student");

      setStudents(
        studentsData.map((l: any) => ({
          id: l.id,
          full_name: l.full_name,
          email: l.email,
          role: l.role,
          department_id: l.department_id,
          department_name: l.department_id
            ? (deptMap[l.department_id] ?? null)
            : null,
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
    loadData();
  }, [loadData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (!uniId) throw new Error("University ID not found.");
      
      const res = await fetch('/api/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          role: 'student',
          department_id: newDeptId || null,
          university_id: uniId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setNewName(''); setNewEmail(''); setNewDeptId('');
      setShowModal(false)
      alert(`Success! ${newName} has been added. They can now generate their login password on the portal using their email.`)
      await loadData()
    } catch (err: any) {
      setError(err.message)
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
    } catch (err) {
      alert('An error occurred while resetting password')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this student from the portal?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    await loadData();
  }

  const filtered = students.filter((l) => {
    const matchSearch =
      (l.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email || "").toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || l.department_id === filterDept;
    const matchStatus = !filterStatus || l.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

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
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              Students
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {students.length} total students · Manage and onboard
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
            <label style={{ cursor: importing ? "not-allowed" : "pointer" }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                style={{ display: "none" }}
                disabled={importing}
              />
              <span
                className="btn-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  cursor: importing ? "not-allowed" : "pointer",
                  opacity: importing ? 0.6 : 1,
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
                setShowModal(true);
              }}
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

        {/* Filters */}
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
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="select"
              style={{ paddingRight: "32px", minWidth: "160px" }}
            >
              <option value="">All Departments</option>
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
              gridTemplateColumns: "2fr 1fr 120px 80px",
              gap: "16px",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-primary)",
              background: "var(--bg-secondary)",
            }}
          >
            {["Student", "Department", "Status", ""].map((h) => (
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
                {search || filterDept || filterStatus
                  ? "No students match your filters."
                  : "No students yet. Add or upload a CSV to get started."}
              </p>
            </div>
          ) : (
            filtered.map((l) => (
              <StudentRow key={l.id} student={l} onDelete={handleDelete} onResetPassword={setConfirmReset} />
            ))
          )}
        </div>

        {/* Add Modal */}
        {showModal && (
          <Modal
            title="Add Student"
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
              <div>
                <label
                  className="label"
                  style={{ display: "block", marginBottom: "8px" }}
                >
                  Department{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="select"
                    style={{
                      width: "100%",
                      paddingRight: "32px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">No department</option>
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
