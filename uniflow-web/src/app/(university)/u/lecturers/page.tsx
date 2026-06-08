"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
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
  short_name: string
}

import Modal from "@/components/ui/Modal";

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
  departments,
  onDelete,
  onResetPassword,
  onUpdate,
}: {
  lecturer: Lecturer;
  departments: Department[];
  onDelete: (id: string) => void;
  onResetPassword: (lecturer: Lecturer) => void;
  onUpdate: (id: string, updates: Partial<Lecturer>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(lecturer.full_name);
  const [editEmail, setEditEmail] = useState(lecturer.email);
  const [editDeptId, setEditDeptId] = useState(lecturer.department_id || "");

  const s = STATUS_COLORS[lecturer.status] ?? STATUS_COLORS.pending;

  const handleSave = () => {
    onUpdate(lecturer.id, {
      full_name: editName,
      email: editEmail,
      department_id: editDeptId || null,
    });
    setIsEditing(false);
  };

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
    >
      {/* Name + Email */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '4px' }} />
            <input className="input" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ padding: '4px' }} />
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
                {(lecturer.full_name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                {lecturer.full_name}
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {lecturer.email} · <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{lecturer.role}</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Department */}
      <div>
        {isEditing ? (
          <select className="select" value={editDeptId} onChange={(e) => setEditDeptId(e.target.value)} style={{ padding: '4px', width: '100%' }}>
            <option value="">No department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Building2 size={11} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {lecturer.department_name ?? "—"}
            </span>
          </div>
        )}
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
          {lecturer.status}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        {isEditing ? (
          <>
            <button onClick={handleSave} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)" }}>Save</button>
            <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--text-muted)" }} title="Edit"><User size={14} /></button>
            <button onClick={() => onResetPassword(lecturer)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--text-muted)" }} title="Reset Password"><Key size={14} /></button>
            <button onClick={() => onDelete(lecturer.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--text-muted)" }}><Trash2 size={13} /></button>
          </>
        )}
      </div>
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
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(0);
  const [error, setError] = useState("");
  const [uniId, setUniId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDeptId, setNewDeptId] = useState("");
  const [newRole, setNewRole] = useState<'lecturer' | 'dean' | 'hod'>('lecturer')

  const [tempPassword, setTempPassword] = useState<{ password: string, email: string, name: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState<Lecturer | null>(null)
  const [copied, setCopied] = useState(false)

  const CSV_TEMPLATE = `full_name,email,role,department_short_name\nDr. John Doe,john@uni.edu,lecturer,CSC\nProf. Jane Smith,jane@uni.edu,dean,FOA\nDr. Mike Ade,mike@uni.edu,hod,MTH`;

  function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staff_template.csv";
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

        if (!row.full_name || !row.email || !row.role) {
          errors.push(`Row ${lineNum}: Missing full_name, email, or role`);
          continue;
        }

        if (!validateEmail(row.email)) {
          errors.push(`Row ${lineNum}: Invalid email format "${row.email}"`);
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
              role: (row.role.toLowerCase() as any),
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
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("university_id")
      .eq("id", session.user.id)
      .single();
    
    if (!profile?.university_id) {
      setLoading(false);
      return;
    }
    
    setUniId(profile.university_id);

    try {
      const staffRes = await fetch(`/api/staff?university_id=${profile.university_id}`)
      const { data: allProfiles } = await staffRes.json()

      const { data: deptData } = await supabase
          .from("departments")
          .select("id, name, short_name")
          .eq("university_id", profile.university_id)
          .order("name");

      const deptMap: Record<string, string> = {};
      (deptData ?? []).forEach((d) => {
        deptMap[d.id] = d.name;
      });

      const lecRoles = ['lecturer', 'dean', 'hod'];
      const lecturersData = (allProfiles || []).filter((p: { role: string }) => {
        const normalizedRole = (p.role || "").toLowerCase().trim();
        return lecRoles.includes(normalizedRole);
      });

      setDepartments(deptData ?? []);
      setLecturers(
        lecturersData.map((l: any) => ({
          id: l.id,
          full_name: l.full_name || "Unknown",
          email: l.email || "",
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
      console.error("LecturersPage: Data loading failed:", message);
      setError("Failed to load staff list: " + message);
    }
    
    setLoading(false);
  }, [uniId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (!validateEmail(newEmail)) {
        setError("Invalid email format.");
        return;
    }

    setSaving(true)
    try {
      if (!uniId) throw new Error("University ID not found. Please refresh the page.");
      
      const res = await fetch('/api/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          role: newRole,
          department_id: newDeptId || null,
          university_id: uniId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setNewName(''); setNewEmail(''); setNewDeptId(''); setNewRole('lecturer')
      setShowModal(false)
      alert(`Success! ${newName} has been added. They can now generate their login password on the login page using their email.`)
      await loadData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async (lecturer: Lecturer) => {
    setConfirmReset(null)
    setSaving(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lecturer.email })
      })

      const data = await res.json()
      if (data.success) {
        alert(`Password reset for ${lecturer.full_name}. They should now use the "Forgot Password" tool on the login page to get a new temporary password.`)
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
    if (!confirm("Remove this lecturer from the portal?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    await loadData();
  }

  async function handleUpdate(id: string, updates: Partial<Lecturer>) {
    if (updates.email && !validateEmail(updates.email)) {
      alert("Invalid email format");
      return;
    }
    await supabase.from("profiles").update({
      full_name: updates.full_name,
      email: updates.email,
      department_id: updates.department_id,
    }).eq("id", id);
    await loadData();
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filtered = lecturers.filter((l) => {
    const matchSearch =
      (l.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email || "").toLowerCase().includes(search.toLowerCase());
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
    <>
      {/* Confirmation Modal */}
      {confirmReset && (
        <Modal
          title="Reset Password?"
          onClose={() => setConfirmReset(null)}
          maxWidth="400px"
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: 'rgba(245,158,11,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px', border: '1px solid rgba(245,158,11,0.2)',
            marginLeft: 'auto', marginRight: 'auto',
          }}>
            <AlertTriangle size={24} color="#f59e0b" />
          </div>

          <p style={{
            fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px',
            lineHeight: 1.5, textAlign: 'center'
          }}>
            Are you sure you want to reset the password for <strong>{confirmReset.full_name}</strong>? 
            A new temporary password will be generated immediately.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setConfirmReset(null)}
              style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent', color: 'var(--text-secondary)',
                fontWeight: 600, fontSize: '14px', border: '1px solid var(--border-primary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleResetPassword(confirmReset)}
              style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand)', color: 'white',
                fontWeight: 700, fontSize: '14px', border: 'none',
                cursor: 'pointer',
              }}
            >
              Yes, Reset
            </button>
          </div>
        </Modal>
      )}

      {/* Password Result Modal */}
      {tempPassword && (
        <Modal
          title="Temporary Credentials"
          onClose={() => setTempPassword(null)}
          maxWidth="400px"
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: 'rgba(34,197,94,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px', border: '1px solid rgba(34,197,94,0.2)',
            marginLeft: 'auto', marginRight: 'auto',
          }}>
            <Key size={24} color="#22c55e" />
          </div>

          <p style={{
            fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center'
          }}>
            A temporary password has been generated for <strong>{tempPassword.name}</strong> ({tempPassword.email}).
            Please share this with them manually.
          </p>

          <div style={{
            padding: '16px', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', marginBottom: '20px',
          }}>
            <code style={{
              fontSize: '16px', fontWeight: 700, color: 'var(--brand)',
              letterSpacing: '0.05em',
            }}>
              {tempPassword.password}
            </code>
            <button
              onClick={() => copyToClipboard(tempPassword.password)}
              style={{
                background: "none", border: "none", color: "var(--text-muted)",
                cursor: "pointer", padding: "4px", display: "flex", alignItems: "center",
              }}
            >
              {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
            </button>
          </div>

          <button
            onClick={() => setTempPassword(null)}
            style={{
              width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand)', color: 'white',
              fontWeight: 700, fontSize: '14px', border: 'none',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </Modal>
      )}

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
              <Plus size={15} /> Add Staff
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
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "20px",
            }}
          >
            <p style={{ fontSize: "13px", color: "var(--success)" }}>
              ✓ {importSuccess} staff member{importSuccess !== 1 ? "s" : ""} imported successfully
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
              border: "1px solid rgba(239,68,68,0.2)",
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
              gridTemplateColumns: "2fr 1fr 120px 80px",
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
              <LecturerRow key={l.id} lecturer={l} departments={departments} onDelete={handleDelete} onResetPassword={setConfirmReset} onUpdate={handleUpdate} />
            ))
          )}
        </div>

        {/* Add Modal */}
        {showModal && (
          <Modal
            title="Add Staff"
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
          </Modal>
        )}
      </div>
    </>
  );
}
