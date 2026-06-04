"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users,
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

interface Lecturer {
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
  code: string
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

function LecturerRow({
  lecturer,
  onDelete,
}: {
  lecturer: Lecturer;
  onDelete: (id: string) => void;
}) {
  const s = STATUS_COLORS[lecturer.status] ?? STATUS_COLORS.pending;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 120px 40px",
        alignItems: "center",
        gap: "16px",
        padding: "14px 16px",
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
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
            {lecturer.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {lecturer.full_name}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {lecturer.email} · <span style={{ color: 'var(--brand-lighter)', textTransform: 'capitalize' }}>{lecturer.role}</span>
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
          {lecturer.department_name ?? "—"}
        </span>
      </div>

      {/* Status */}
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          color: s.text,
          background: s.bg,
          border: `1px solid ${s.border}`,
          borderRadius: "6px",
          padding: "3px 8px",
          display: "inline-block",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {lecturer.status}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(lecturer.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Trash2 size={13} style={{ color: "var(--text-muted)" }} />
      </button>
    </div>
  );
}

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
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
  const [newRole, setNewRole] = useState<'lecturer' | 'dean' | 'hod'>('lecturer')

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
      .select("university_id, role, department_id")
      .eq("id", session.user.id)
      .single();
    if (!profile) return;
    setUniId(profile.university_id);

    const [lecRes, deptRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, department_id, status, role, created_at")
        .in("role", ['lecturer', 'dean', 'hod'])
        .eq("university_id", profile.university_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("departments")
        .select("id, name, code")
        .eq("university_id", profile.university_id)
        .order("name"),
    ]);

    const deptMap: Record<string, string> = {};
    (deptRes.data ?? []).forEach((d) => {
      deptMap[d.id] = d.name;
    });

    setDepartments(deptRes.data ?? []);
    setLecturers(
      (lecRes.data ?? []).map((l) => ({
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
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { error: err } = await supabase.from("profiles").insert({
        full_name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        department_id: newDeptId || null,
        university_id: uniId,
        role: newRole,
        status: "pending",
      });
      if (err) throw new Error(err.message);
      setNewName("");
      setNewEmail("");
      setNewDeptId("");
      setNewRole("lecturer");
      setShowModal(false);
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
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
      const deptMap: Record<string, string> = {};
      departments.forEach((d) => {
        deptMap[d.name.toLowerCase()] = d.id;
        deptMap[d.code.toLowerCase()] = d.id;
      });

      const inserts = csvRows.map((r) => ({
        full_name: r.name,
        email: r.email.toLowerCase(),
        department_id: r.dept ? (deptMap[r.dept.toLowerCase()] ?? null) : null,
        university_id: uniId,
        role: "lecturer",
        status: "pending",
      }));

      const { error: err } = await supabase.from("profiles").insert(inserts);
      if (err) throw new Error(err.message);
      setCsvMode(false);
      setCsvRows([]);
      setShowModal(false);
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this lecturer from the portal?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    await loadData();
  }

  const filtered = lecturers.filter((l) => {
    const matchSearch =
      l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || l.department_id === filterDept;
    const matchStatus = !filterStatus || l.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const counts = {
    total: lecturers.length,
    active: lecturers.filter((l) => l.status === "active").length,
    pending: lecturers.filter((l) => l.status === "pending").length,
  };

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
            Staff
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {counts.total} total · {counts.active} active · {counts.pending}{" "}
            pending
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
            <Plus size={15} /> Add Staff
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
            placeholder="Search lecturers..."
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
          {["Staff", "Department", "Status", ""].map((h) => (
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
            <Users
              size={32}
              style={{ color: "var(--text-muted)", marginBottom: "12px" }}
            />
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {search || filterDept || filterStatus
                ? "No staff match your filters."
                : "No staff yet. Add or upload a CSV to get started."}
            </p>
          </div>
        ) : (
          filtered.map((l) => (
            <LecturerRow key={l.id} lecturer={l} onDelete={handleDelete} />
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
            csvMode ? `Import ${csvRows.length} Staff` : "Add Staff"
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
                    `Import ${csvRows.length} Staff`
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
                    placeholder="Dr. John Adeyemi"
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
                    placeholder="lecturer@university.edu"
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
                  Role
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={newRole}
                    onChange={(e) =>
                      setNewRole(e.target.value as "lecturer" | "dean" | "hod")
                    }
                    className="select"
                    style={{
                      width: "100%",
                      paddingRight: "32px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="lecturer">Lecturer</option>
                    <option value="dean">Dean</option>
                    <option value="hod">Head of Department (HOD)</option>
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
                    "Add Staff"
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
