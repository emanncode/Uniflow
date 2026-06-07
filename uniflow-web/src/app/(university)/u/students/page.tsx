"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  GraduationCap,
  Plus,
  Search,
  X,
  Loader2,
  Trash2,
  Upload,
  Mail,
  User,
  Building2,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
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
          maxWidth: "500px",
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
}: {
  student: Student;
  onDelete: (id: string) => void;
}) {
  const s = STATUS_COLORS[student.status] ?? STATUS_COLORS.pending;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 120px 40px",
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
      {/* Name + Email */}
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
            {student.full_name.charAt(0).toUpperCase()}
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
            {student.email} · <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{student.role}</span>
          </p>
        </div>
      </div>

      {/* Department */}
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <Building2
          size={11}
          style={{ color: "var(--text-muted)", flexShrink: 0 }}
        />
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          {student.department_name ?? "—"}
        </span>
      </div>

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

      {/* Delete */}
      <button
        onClick={() => onDelete(student.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "auto",
        }}
      >
        <Trash2 size={13} style={{ color: "var(--text-muted)" }} />
      </button>
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
  const [error, setError] = useState("");
  const [uniId, setUniId] = useState<string | null>(null);
  const [csvMode, setCsvMode] = useState(false);
  const [csvRows, setCsvRows] = useState<
    { name: string; email: string; dept: string }[]
  >([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDeptId, setNewDeptId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("university_id")
      .eq("id", session.user.id)
      .single();
    if (!profile) return;
    setUniId(profile.university_id);

    try {
      // 1. Fetch departments via Supabase
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

      // 2. Fetch students via API (service role proxy) to bypass RLS
      const staffRes = await fetch(`/api/staff?university_id=${profile.university_id}`)
      const { data: allProfiles, error: sErr } = await staffRes.json()

      if (!staffRes.ok || sErr) throw new Error(sErr || 'Failed to fetch students via API')

      const studentsData = (allProfiles || []).filter((p: any) => (p.role || "").toLowerCase().trim() === "student");

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
    } catch (err: any) {
      console.error("StudentsPage: Data loading failed:", err);
      setError("Failed to load student list: " + err.message);
    }
    
    setLoading(false);
  }

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
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").slice(1).filter(Boolean);
      const rows = lines
        .map((line) => {
          const [name, email, dept] = line
            .split(",")
            .map((s) => s.trim().replace(/"/g, ""));
          return { name, email, dept };
        })
        .filter((r) => r.name && r.email);
      setCsvRows(rows);
      setCsvMode(true);
    };
    reader.readAsText(file);
  }

  async function handleBulkImport() {
    setSaving(true);
    setError("");
    try {
      if (!uniId) throw new Error("University ID not found.");

      const deptMap: Record<string, string> = {};
      departments.forEach((d) => {
        deptMap[d.name.toLowerCase()] = d.id;
        deptMap[d.short_name.toLowerCase()] = d.id;
      });

      let successCount = 0;
      let failCount = 0;
      let lastError = "";

      for (const row of csvRows) {
        try {
          const res = await fetch('/api/create-staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: row.name,
              email: row.email.toLowerCase(),
              department_id: row.dept ? (deptMap[row.dept.toLowerCase()] ?? null) : null,
              university_id: uniId,
              role: "student",
            }),
          });
          
          if (res.ok) {
            successCount++;
          } else {
            const data = await res.json();
            failCount++;
            lastError = data.error;
          }
        } catch (err) {
          failCount++;
          lastError = (err as Error).message;
        }
      }

      if (failCount > 0) {
        setError(`Imported ${successCount} students. ${failCount} failed. Last error: ${lastError}`);
      } else {
        setCsvMode(false);
        setCsvRows([]);
        setShowModal(false);
      }
      
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
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
        <div style={{ display: "flex", gap: "10px" }}>
          <label
            className="btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            <Upload size={14} /> Upload CSV
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              style={{ display: "none" }}
            />
          </label>
          <button
            onClick={() => {
              setShowModal(true);
              setCsvMode(false);
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
            gridTemplateColumns: "2fr 1fr 120px 40px",
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
            <StudentRow key={l.id} student={l} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* CSV download template hint */}
      <p
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          marginTop: "10px",
        }}
      >
        CSV format:{" "}
        <code style={{ color: "var(--text-secondary)" }}>
          Name, Email, Department Code
        </code>{" "}
        (header row required)
      </p>

      {/* Add Modal */}
      {showModal && (
        <Modal
          title={
            csvMode ? `Import ${csvRows.length} Students` : "Add Student"
          }
          onClose={() => {
            setShowModal(false);
            setCsvMode(false);
            setCsvRows([]);
            setError("");
          }}
        >
          {csvMode ? (
            <div>
              {error && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    background: "var(--danger-muted)",
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 12px",
                    marginBottom: "16px",
                  }}
                >
                  <AlertCircle size={14} style={{ color: "var(--danger)" }} />
                  <p style={{ fontSize: "12px", color: "var(--danger)" }}>
                    {error}
                  </p>
                </div>
              )}
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-md)",
                  maxHeight: "240px",
                  overflowY: "auto",
                  marginBottom: "16px",
                }}
              >
                {csvRows.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border-primary)",
                    }}
                  >
                    <CheckCircle2
                      size={13}
                      style={{ color: "var(--success)", flexShrink: 0 }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-primary)",
                        }}
                      >
                        {r.name}
                      </p>
                      <p
                        style={{ fontSize: "11px", color: "var(--text-muted)" }}
                      >
                        {r.email} {r.dept && `· ${r.dept}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    setCsvMode(false);
                    setCsvRows([]);
                  }}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
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
                    `Import ${csvRows.length} Students`
                  )}
                </button>
              </div>
            </div>
          ) : (
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
                    border: "1px solid rgba(239, 68, 68, 0.15)",
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
          )}
        </Modal>
      )}
    </div>
  );
}
