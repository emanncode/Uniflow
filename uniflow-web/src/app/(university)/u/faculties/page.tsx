"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUniversity } from "@/context/UniversityContext";
import { staffApiUrl } from "@/lib/staff-api";
import {
  BookOpen,
  Plus,
  Search,
  X,
  Loader2,
  Trash2,
  UserCheck,
  Building2,
  ChevronDown,
  AlertTriangle,
  Users,
} from "lucide-react";

interface Faculty {
  id: string;
  name: string;
  short_name: string;
  dean_id: string | null;
  dean_name: string | null;
  dept_count: number;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  faculty: string | null;
}

import Modal from "@/components/ui/Modal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

function FacultyCard({
  faculty,
  deans,
  onAssignDean,
  onDelete,
}: {
  faculty: Faculty;
  deans: Profile[];
  onAssignDean: (facultyId: string, deanId: string) => void;
  onDelete: (id: string) => void;
}) {
  const [assigning, setAssigning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Deans who belong to this faculty or haven't been assigned to any faculty yet
  const eligibleDeans = deans.filter(d => !d.faculty || d.faculty === faculty.short_name);

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        borderRadius: "var(--radius-md)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "all var(--transition)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor =
          "var(--border-secondary)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor =
          "var(--border-primary)")
      }
    >
      <ConfirmationModal
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { onDelete(faculty.id); setShowConfirm(false); }}
        title="Delete Faculty?"
        message={`Are you sure you want to delete ${faculty.name}?`}
        confirmText="Yes, Delete"
        isDestructive
        icon={Trash2}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BookOpen size={18} style={{ color: "var(--text-secondary)" }} />
          </div>
          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "3px",
              }}
            >
              {faculty.name}
            </p>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "4px",
                padding: "1px 5px",
                fontFamily: "monospace",
              }}
            >
              {faculty.short_name}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            flexShrink: 0,
          }}
        >
          <Trash2 size={13} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Building2 size={12} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {faculty.dept_count} department{faculty.dept_count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border-primary)",
          paddingTop: "14px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Dean
        </p>
        {faculty.dean_name ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--brand), var(--warning))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {faculty.dean_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {faculty.dean_name}
            </span>
            <button
              onClick={() => setAssigning(true)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                color: "var(--brand)",
              }}
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAssigning(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--warning-muted)",
              border: "1px solid var(--warning-muted)",
              borderRadius: "8px",
              padding: "7px 12px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            <UserCheck size={13} style={{ color: "var(--warning)" }} />
            <span
              style={{
                fontSize: "12px",
                color: "var(--warning)",
                fontWeight: 500,
              }}
            >
              Assign Dean
            </span>
          </button>
        )}

        {assigning && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ position: "relative" }}>
              <select
                className="input"
                style={{
                  width: "100%",
                  appearance: "none",
                  paddingRight: "32px",
                }}
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    onAssignDean(faculty.id, e.target.value);
                    setAssigning(false);
                  }
                }}
              >
                <option value="" disabled>
                  {eligibleDeans.length > 0 ? "Select a dean..." : "No deans found in this faculty"}
                </option>
                {eligibleDeans.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} — {d.email}
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
            <button
              onClick={() => setAssigning(false)}
              style={{
                marginTop: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                color: "var(--text-muted)",
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Access sub-pages under this faculty.
          - Departments: students are registered here (depts belong to faculty)
          - Lecturers: assigned at faculty level, can teach across depts/courses
      */}
      <div
        style={{
          borderTop: "1px solid var(--border-primary)",
          paddingTop: "12px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href={`/u/departments?faculty=${faculty.short_name}`}
          style={{
            fontSize: "12px",
            color: "var(--brand)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            background: "var(--bg-hover)",
            borderRadius: "6px",
            border: "1px solid var(--border-primary)",
            fontWeight: 500,
          }}
        >
          <Building2 size={13} /> Departments
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>(students here)</span>
        </Link>

        <Link
          href={`/u/lecturers?faculty=${faculty.short_name}`}
          style={{
            fontSize: "12px",
            color: "var(--brand)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            background: "var(--bg-hover)",
            borderRadius: "6px",
            border: "1px solid var(--border-primary)",
            fontWeight: 500,
          }}
        >
          <Users size={13} /> Lecturers / Staff
        </Link>
      </div>
    </div>
  );
}

export default function FacultiesPage() {
  const { universityId: contextUniId, isReady } = useUniversity();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [deans, setDeans] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uniId, setUniId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newShortName, setNewShortName] = useState("");

  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(0);

  const [confirmDelete, setConfirmDelete] = useState<Faculty | null>(null);

  const CSV_TEMPLATE = `name,short_name\nFaculty of Science,FOS\nFaculty of Arts,FOA\nFaculty of Engineering,FOE`;

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faculties_template.csv";
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
      const lines = text
        .trim()
        .split("\n")
        .filter((l) => l.trim());
      if (lines.length < 2)
        throw new Error("CSV is empty or missing data rows");

      const headers = lines[0]
        .toLowerCase()
        .split(",")
        .map((h) => h.trim());
      const rows = lines.slice(1);

      const errors: string[] = [];
      let successCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const vals = rows[i].split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = vals[idx] ?? "";
        });
        const lineNum = i + 2;

        if (!row.name || !row.short_name) {
          errors.push(`Row ${lineNum}: Missing name or short_name`);
          continue;
        }

        const { error: insErr } = await supabase.from("faculties").insert({
          name: row.name,
          short_name: row.short_name.toUpperCase(),
          university_id: uniId,
        });

        if (insErr) {
          errors.push(`Row ${lineNum}: ${insErr.message}`);
          continue;
        }
        successCount++;
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

  useEffect(() => {
    if (!isReady || !contextUniId) return;
    loadData(contextUniId);
  }, [isReady, contextUniId]);

  async function loadData(currentUniId: string) {
    setLoading(true);
    setUniId(currentUniId);

    try {
      const [facRes, deptRes, staffRes] = await Promise.all([
        supabase
          .from("faculties")
          .select(`id, name, short_name, dean_id, created_at`)
          .eq("university_id", currentUniId)
          .order("created_at", { ascending: false }),
        supabase
          .from("departments")
          .select("faculty")
          .eq("university_id", currentUniId),
        fetch(staffApiUrl(currentUniId, { roles: ["dean"] })),
      ]);
      const facData = facRes.data;
      const deptCounts = deptRes.data;
      const staffJson = await staffRes.json();
      if (!staffRes.ok) throw new Error(staffJson.error || "Failed to fetch staff");
      const { data: deanData } = staffJson as {
        data?: { id: string; full_name: string; email: string; faculty: string | null }[];
      };

      const countMap: Record<string, number> = {};
      (deptCounts ?? []).forEach((d: { faculty?: string }) => {
        const key = d.faculty;
        if (key) countMap[key] = (countMap[key] ?? 0) + 1;
      });

      const deanAssignmentMap: Record<string, string> = {};
      (facData ?? []).forEach(f => {
        if (f.dean_id) deanAssignmentMap[f.dean_id] = f.short_name;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedDeans = (deanData ?? []).map((d: any) => ({
        id: d.id,
        full_name: d.full_name,
        email: d.email,
        faculty: d.faculty || deanAssignmentMap[d.id] || null
      }));

      const deanNameMap: Record<string, string> = {};
      mappedDeans.forEach((d: { id: string; full_name: string }) => {
        deanNameMap[d.id] = d.full_name;
      });

      setFaculties(
        (facData ?? []).map((f: { id: string; name: string; short_name: string; dean_id: string | null; created_at: string }) => ({
          id: f.id,
          name: f.name,
          short_name: f.short_name,
          dean_id: f.dean_id,
          dean_name: f.dean_id ? (deanNameMap[f.dean_id] ?? null) : null,
          dept_count: countMap[f.short_name] ?? 0,
          created_at: f.created_at,
        })),
      );
      setDeans(mappedDeans);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Data loading failed:", message);
    }

    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!uniId) return;
    setError("");
    setSaving(true);
    try {
      const { error: err } = await supabase.from("faculties").insert({
        name: newName.trim(),
        short_name: newShortName.trim().toUpperCase(),
        university_id: uniId,
      });
      if (err) throw new Error(err.message);
      setNewName("");
      setNewShortName("");
      setShowModal(false);
      if (contextUniId) await loadData(contextUniId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create faculty";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignDean(facultyId: string, deanId: string) {
    await supabase
      .from("faculties")
      .update({ dean_id: deanId })
      .eq("id", facultyId);
    if (contextUniId) await loadData(contextUniId);
  }

  async function handleDelete(id: string) {
    setConfirmDelete(null);
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from("faculties")
        .delete()
        .eq("id", id);
      if (err) throw err;
      if (contextUniId) await loadData(contextUniId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete faculty";
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  const filtered = faculties.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.short_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id)}
        title="Delete Faculty?"
        message={`Are you sure you want to delete the ${confirmDelete?.name}? All associated departments will need to be re-assigned. This action cannot be undone.`}
        confirmText="Yes, Delete"
        isDestructive
        isLoading={saving}
        icon={AlertTriangle}
      />

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
            Faculties
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {faculties.length}{" "}
            {faculties.length === 1 ? "faculty" : "faculties"} · Manage departments, lecturers and students
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
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
            onClick={() => setShowModal(true)}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={15} /> Add Faculty
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
            ✓ {importSuccess} facult{importSuccess !== 1 ? "ies" : "y"} imported
            successfully
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

      <div
        style={{
          position: "relative",
          maxWidth: "360px",
          marginBottom: "24px",
        }}
      >
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
          placeholder="Search faculties..."
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
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            border: "1px dashed var(--border-secondary)",
            borderRadius: "14px",
          }}
        >
          <BookOpen
            size={32}
            style={{ color: "var(--text-muted)", marginBottom: "12px" }}
          />
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            {search
              ? "No faculties match your search."
              : "No faculties yet. Add your first faculty."}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {filtered.map((f) => (
            <FacultyCard
              key={f.id}
              faculty={f}
              deans={deans}
              onAssignDean={handleAssignDean}
              onDelete={() => setConfirmDelete(f)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Add New Faculty" onClose={() => setShowModal(false)}>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {error && (
              <div style={{ color: "var(--danger)", fontSize: "12px" }}>
                {error}
              </div>
            )}
            <div>
              <label
                className="label"
                style={{ display: "block", marginBottom: "8px" }}
              >
                Faculty Name
              </label>
              <input
                required
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input"
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label
                className="label"
                style={{ display: "block", marginBottom: "8px" }}
              >
                Short Name
              </label>
              <input
                required
                type="text"
                value={newShortName}
                onChange={(e) => setNewShortName(e.target.value)}
                className="input"
                style={{ width: "100%", boxSizing: "border-box" }}
                maxLength={10}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              {saving ? "Creating..." : "Create Faculty"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
