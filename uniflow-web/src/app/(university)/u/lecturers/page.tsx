"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUniversity } from "@/context/UniversityContext";
import { LECTURER_ROLES, staffApiUrl } from "@/lib/staff-api";
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
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { validateAndNormalizeEmail } from "@/lib/email";

interface Lecturer {
  id: string
  full_name: string
  email: string
  role: string
  department_id: string | null
  department_name: string | null
  faculty: string | null
  status: string
  created_at: string
}

interface Department {
  id: string
  name: string
  short_name: string
  faculty: string
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

function LecturerRow({
  lecturer,
  onDelete,
  onResetPassword,
  onUpdate,
}: {
  lecturer: Lecturer;
  onDelete: (id: string) => void;
  onResetPassword: (lecturer: Lecturer) => void;
  onUpdate: (id: string, updates: Partial<Lecturer>) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(lecturer.full_name);
  const [editEmail, setEditEmail] = useState(lecturer.email);
  const [editRole, setEditRole] = useState(lecturer.role);
  const [saving, setSaving] = useState(false);

  const s = STATUS_COLORS[lecturer.status] ?? STATUS_COLORS.pending;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(lecturer.id, {
        full_name: editName,
        email: editEmail,
        role: editRole,
      });
      setIsEditing(false);
    } catch (e: any) {
      alert(e.message || "Failed to update lecturer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 120px 80px",
        alignItems: "center",
        gap: "16px",
        padding: "10px 16px",
        borderBottom: "1px solid var(--border-primary)",
        transition: "all var(--transition)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '4px' }} disabled={saving} />
            <input className="input" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ padding: '4px' }} disabled={saving} />
            <select 
              className="select" 
              value={editRole} 
              onChange={(e) => setEditRole(e.target.value)} 
              style={{ padding: '4px', height: 'auto', fontSize: '11px' }} 
              disabled={saving}
            >
              <option value="lecturer">Lecturer</option>
              <option value="dean">Dean</option>
              <option value="hod">HOD</option>
            </select>
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
  const { universityId: contextUniId, isReady } = useUniversity();
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterFac, setFilterFac] = useState("");
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false)

  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Load Data ────────────────────────────────────────────────────────────
  const loadData = useCallback(async (currentUniId: string) => {
    setLoading(true);
    setError("");
    setUniId(currentUniId);

    try {
      const [staffRes, facRes, deptRes] = await Promise.all([
        fetch(staffApiUrl(currentUniId, { roles: LECTURER_ROLES })),
        supabase
          .from("faculties")
          .select("id, name, short_name, dean_id")
          .eq("university_id", currentUniId)
          .order("name"),
        supabase
          .from("departments")
          .select("id, name, short_name, faculty, hod_id")
          .eq("university_id", currentUniId)
          .order("name"),
      ]);
      const staffData = await staffRes.json()
      if (!staffRes.ok) throw new Error(staffData.error || "Failed to fetch staff");
      const lecturersData = staffData.data || []
      const facData = facRes.data;
      const deptData = deptRes.data;
      setFaculties(facData ?? []);
      
      const deptList = (deptData ?? []).map((d: any) => ({
        id: d.id,
        name: d.name,
        short_name: d.short_name,
        faculty: d.faculty
      }));
      setDepartments(deptList);

      const deptMap: Record<string, { name: string, faculty: string }> = {};
      (deptData ?? []).forEach((d) => {
        deptMap[d.id] = { name: d.name, faculty: d.faculty };
      });

      // Dean lookup: profile_id -> faculty_short_name
      const deanMap: Record<string, string> = {};
      (facData ?? []).forEach(f => {
        if (f.dean_id) deanMap[f.dean_id] = f.short_name;
      });

      // HOD lookup: profile_id -> { id, name, faculty }
      const hodMap: Record<string, { id: string, name: string, faculty: string }> = {};
      (deptData ?? []).forEach(d => {
        if (d.hod_id) hodMap[d.hod_id] = { id: d.id, name: d.name, faculty: d.faculty };
      });

      const mapped = lecturersData.map((l: any) => {
        let dId = l.department_id;
        let dName = l.department_id ? (deptMap[l.department_id]?.name ?? null) : null;
        let fac = l.department_id ? (deptMap[l.department_id]?.faculty ?? null) : (l.faculty || null);

        // Dean/HOD override if department_id is null
        if (l.role === 'dean' && !fac) fac = deanMap[l.id] || null;
        if (l.role === 'hod' && !dId) {
          const h = hodMap[l.id];
          if (h) { dId = h.id; dName = h.name; fac = h.faculty; }
        }

        return {
          id: l.id,
          full_name: l.full_name || "Unknown",
          email: l.email || "",
          role: l.role,
          department_id: dId,
          department_name: dName,
          faculty: fac,
          status: l.status ?? "pending",
          created_at: l.created_at,
        };
      });

      setLecturers(mapped);
    } catch (err: any) {
      console.error("LecturersPage: loadData failed:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !contextUniId) return;
    loadData(contextUniId);
  }, [isReady, contextUniId, loadData]);

  // Support direct links from Departments page
  useEffect(() => {
    if (departments.length === 0) return;
    const dParam = searchParams.get("department");
    const fParam = searchParams.get("faculty");
    if (fParam) setFilterFac(fParam);
    if (dParam) {
      const dept = departments.find(d => d.short_name === dParam || d.id === dParam);
      if (dept) setFilterDept(dept.id);
    }
  }, [searchParams, departments]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const emailResult = validateEmail(newEmail);
    if (!emailResult.valid) {
        setError(emailResult.error || "Invalid email format.");
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
          role: newRole,
          department_id: newDeptId || null,
          university_id: uniId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const name = newName;
      setNewName(''); setNewEmail(''); setNewDeptId(''); setNewRole('lecturer')
      setShowModal(false)
      setSuccessModal({
        title: "Staff Added",
        message: `${name} has been added successfully.`
      });
      if (contextUniId) await loadData(contextUniId)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const errs: string[] = [];
      let success = 0;
      for (let i = 0; i < rows.length; i++) {
        const vals = rows[i].split(",").map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] ?? ""; });
        const lineNum = i + 2;
        if (!row.full_name || !row.email || !row.role) {
          errs.push(`Row ${lineNum}: Missing required fields`);
          continue;
        }
        const emailCheck = validateEmail(row.email);
        if (!emailCheck.valid) {
          errs.push(`Row ${lineNum}: ${emailCheck.error}`);
          continue;
        }
        const dept = departments.find(d => 
          d.short_name.toLowerCase() === row.department_short_name?.toLowerCase() &&
          (!filterFac || d.faculty === filterFac)
        );
        const res = await fetch('/api/create-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: row.full_name,
            email: emailCheck.normalized,
            role: row.role.toLowerCase(),
            department_id: dept?.id || null,
            university_id: uniId,
          }),
        });
        const data = await res.json();
        if (!res.ok) errs.push(`Row ${lineNum}: ${data.error}`);
        else success++;
      }
      setImportErrors(errs);
      setImportSuccess(success);
      if (success > 0 && contextUniId) await loadData(contextUniId);
    } catch (err: any) {
      setImportErrors([err.message]);
    } finally {
      setImporting(false);
      e.target.value = "";
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
        setSuccessModal({
          title: "Reset Link Sent",
          message: `A password reset link has been sent to ${lecturer.full_name}'s email.`
        });
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred while resetting the password.');
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setSaving(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      if (contextUniId) await loadData(contextUniId);
    } catch (e: any) {
      setError(e.message || "Failed to remove staff");
    } finally {
      setSaving(false);
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Lecturer>) => {
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
    if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
    if (contextUniId) await loadData(contextUniId);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const CSV_TEMPLATE = `full_name,email,role,department_short_name\nDr. John Doe,john@uni.edu,lecturer,CSC\nProf. Jane Smith,jane@uni.edu,dean,FOA\nDr. Mike Ade,mike@uni.edu,hod,MTH`;

  function validateEmail(email: string) {
    const result = validateAndNormalizeEmail(email);
    if (result.valid && result.wasCorrected) {
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
    a.download = "staff_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Derived Data ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return lecturers.filter((l) => {
      const matchSearch =
        (l.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (l.email || "").toLowerCase().includes(search.toLowerCase());
      
      // If a filter is selected, show people in that faculty/dept OR people with NO faculty/dept
      const matchFac = !filterFac || l.faculty === filterFac || !l.faculty;
      const matchDept = !filterDept || l.department_id === filterDept || !l.department_id;
      const matchStatus = !filterStatus || l.status === filterStatus;
      
      return matchSearch && matchFac && matchDept && matchStatus;
    });
  }, [lecturers, search, filterFac, filterDept, filterStatus]);

  const counts = useMemo(() => ({
    total: filtered.length,
    active: filtered.filter((l) => l.status === "active").length,
    pending: filtered.filter((l) => l.status === "pending").length,
  }), [filtered]);

  console.log("LecturersPage: Rendering - Total Lecturers in state:", lecturers.length);
  console.log("LecturersPage: Rendering - Filtered List:", filtered);

  return (
    <>
      <ConfirmationModal
        visible={!!successModal}
        onClose={() => setSuccessModal(null)}
        onConfirm={() => setSuccessModal(null)}
        title={successModal?.title || ""}
        message={successModal?.message || ""}
        confirmText="OK"
        icon={Check}
      />

      <ConfirmationModal
        visible={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        onConfirm={() => confirmReset && handleResetPassword(confirmReset)}
        title="Reset Password?"
        message={`Are you sure you want to reset the password for ${confirmReset?.full_name}?`}
        confirmText="Yes, Reset"
        isDestructive
        isLoading={saving}
        icon={AlertTriangle}
      />

      <ConfirmationModal
        visible={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Remove Staff Member?"
        message="Are you sure you want to remove this staff member?"
        confirmText="Yes, Remove"
        isDestructive
        isLoading={saving}
        icon={Trash2}
      />

      {tempPassword && (
        <Modal title="Temporary Credentials" onClose={() => setTempPassword(null)} maxWidth="400px">
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid rgba(34,197,94,0.2)', marginLeft: 'auto', marginRight: 'auto' }}>
            <Key size={24} color="#22c55e" />
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
            A temporary password has been generated for <strong>{tempPassword.name}</strong>.
          </p>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
            <code style={{ fontSize: '16px', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.05em' }}>{tempPassword.password}</code>
            <button onClick={() => copyToClipboard(tempPassword.password)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
              {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
            </button>
          </div>
          <button onClick={() => setTempPassword(null)} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand)', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Done</button>
        </Modal>
      )}

      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <button onClick={() => router.back()} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", padding: "0 0 4px 0", cursor: "pointer", marginBottom: "2px" }}>
              <ArrowLeft size={13} /> Back to Faculties
            </button>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Staff</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {counts.total} total · {counts.active} active · {counts.pending} pending
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
            <button onClick={() => {
              const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "staff_template.csv"; a.click();
            }} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
              ↓ CSV Template
            </button>
            <label style={{ cursor: importing ? "not-allowed" : "pointer" }}>
              <input type="file" accept=".csv" onChange={handleCSVImport} style={{ display: "none" }} disabled={importing} />
              <span className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: importing ? "not-allowed" : "pointer", opacity: importing ? 0.6 : 1 }}>
                {importing ? <><Loader2 size={13} className="animate-spin" /> Importing...</> : "↑ Import CSV"}
              </span>
            </label>
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              <Plus size={15} /> Add Staff
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "var(--danger-muted)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
            <AlertCircle size={16} style={{ color: "var(--danger)" }} />
            <p style={{ fontSize: "13px", color: "var(--danger)" }}>{error}</p>
          </div>
        )}

        {importSuccess > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--success-muted)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", color: "var(--success)" }}>✓ {importSuccess} staff members imported successfully</p>
            <button onClick={() => setImportSuccess(0)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} style={{ color: "var(--success)" }} /></button>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
            <Search size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search lecturers..." value={search} onChange={(e) => setSearch(e.target.value)} className="input" style={{ width: "100%", paddingLeft: "38px", boxSizing: "border-box" }} />
          </div>
          <div style={{ position: "relative" }}>
            <select value={filterFac} onChange={(e) => { setFilterFac(e.target.value); setFilterDept(""); }} className="select" style={{ paddingRight: "32px", minWidth: "160px" }}>
              <option value="">All Faculties</option>
              {faculties.map((f) => <option key={f.id} value={f.short_name}>{f.name}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          </div>
          <div style={{ position: "relative" }}>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="select" style={{ paddingRight: "32px", minWidth: "160px" }}>
              <option value="">All Departments</option>
              {departments.filter(d => !filterFac || d.faculty === filterFac).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          </div>
          <div style={{ position: "relative" }}>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select" style={{ paddingRight: "32px" }}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "3fr 120px 80px", gap: "16px", padding: "12px 16px", borderBottom: "1px solid var(--border-primary)", background: "var(--bg-secondary)" }}>
            {["Staff", "Status", ""].map((h) => (
              <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}><Loader2 size={24} className="animate-spin" style={{ color: "var(--brand)" }} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Users size={32} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {search || filterFac || filterDept || filterStatus ? "No staff match your filters." : "No staff yet."}
              </p>
            </div>
          ) : (
            filtered.map((l) => (
              <LecturerRow key={l.id} lecturer={l} onDelete={setConfirmDeleteId} onResetPassword={setConfirmReset} onUpdate={handleUpdate} />
            ))
          )}
        </div>

        {showModal && (
          <Modal title="Add Staff" onClose={() => { setShowModal(false); setError(""); }}>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {error && <div style={{ display: "flex", gap: "8px", alignItems: "center", background: "var(--danger-muted)", border: "1px solid var(--danger-muted)", borderRadius: "var(--radius-md)", padding: "10px 12px" }}><AlertCircle size={14} style={{ color: "var(--danger)" }} /><p style={{ fontSize: "12px", color: "var(--danger)" }}>{error}</p></div>}
              <div>
                <label className="label" style={{ display: "block", marginBottom: "8px" }}>Full Name</label>
                <div style={{ position: "relative" }}><User size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} /><input required type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Dr. John Adeyemi" className="input" style={{ width: "100%", paddingLeft: "36px", boxSizing: "border-box" }} /></div>
              </div>
              <div>
                <label className="label" style={{ display: "block", marginBottom: "8px" }}>Email Address</label>
                <div style={{ position: "relative" }}><Mail size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} /><input required type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="lecturer@university.edu" className="input" style={{ width: "100%", paddingLeft: "36px", boxSizing: "border-box" }} /></div>
              </div>
              <div>
                <label className="label" style={{ display: "block", marginBottom: "8px" }}>Role</label>
                <div style={{ position: "relative" }}>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="select" style={{ width: "100%", paddingRight: "32px", boxSizing: "border-box" }}>
                    <option value="lecturer">Lecturer</option>
                    <option value="dean">Dean</option>
                    <option value="hod">Head of Department (HOD)</option>
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                </div>
              </div>
              <div>
                <label className="label" style={{ display: "block", marginBottom: "8px" }}>Department <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span></label>
                <div style={{ position: "relative" }}>
                  <select value={newDeptId} onChange={(e) => setNewDeptId(e.target.value)} className="select" style={{ width: "100%", paddingRight: "32px", boxSizing: "border-box" }}>
                    <option value="">No department</option>
                    {departments.filter(d => !filterFac || d.faculty === filterFac).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button" onClick={() => { setShowModal(false); setError(""); }} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>{saving ? <Loader2 size={14} className="animate-spin" /> : "Add Staff"}</button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  );
}
