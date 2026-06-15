"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Building2,
  Plus,
  Search,
  X,
  Loader2,
  Trash2,
  UserCheck,
  ChevronDown,
  BookOpen,
  ArrowLeft,
  GraduationCap,
  LayoutGrid,
  List,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  short_name: string;
  faculty_id: string;   
  faculty_name: string; 
  hod_id: string | null;
  hod_name: string | null;
  created_at: string;
}

interface Faculty {
  id: string;
  name: string;
  short_name: string;
}
interface Profile {
  id: string;
  full_name: string;
  email: string;
  faculty: string | null;
}

import Modal from "@/components/ui/Modal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { AlertTriangle } from "lucide-react";

function DeptCard({
  dept,
  hods,
  onAssignHod,
  onDelete,
}: {
  dept: Department;
  hods: Profile[];
  onAssignHod: (deptId: string, hodId: string) => void;
  onDelete: (id: string) => void;
}) {
  const [assigning, setAssigning] = useState(false);

  // Filter HODs to only show those registered under THIS faculty
  const eligibleHods = hods.filter(h => h.faculty === dept.faculty_id);

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
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Building2 size={18} style={{ color: "var(--text-secondary)" }} />
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "3px" }}>{dept.name}</p>
            <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-secondary)", background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", borderRadius: "4px", padding: "1px 5px", fontFamily: "monospace" }}>{dept.short_name}</span>
          </div>
        </div>
        <button onClick={() => onDelete(dept.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0 }}>
          <Trash2 size={13} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
        Faculty: {dept.faculty_name}
      </div>

      <div style={{ borderTop: "1px solid var(--border-primary)", paddingTop: "14px" }}>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>HOD</p>
        {assigning ? (
          <div style={{ position: "relative" }}>
            <select onChange={(e) => { if(e.target.value) { onAssignHod(dept.id, e.target.value); setAssigning(false); } }} className="select" style={{ width: "100%", fontSize: "12px" }}>
              <option value="">
                {eligibleHods.length > 0 ? "Select HOD..." : "No HODs found in this faculty"}
              </option>
              {eligibleHods.map(h => <option key={h.id} value={h.id}>{h.full_name} — {h.email}</option>)}
            </select>
            <button onClick={() => setAssigning(false)} style={{ marginTop: "6px", background: "none", border: "none", fontSize: "11px", color: "var(--text-muted)", cursor: "pointer" }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setAssigning(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--warning-muted)", border: "1px solid var(--warning-muted)", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", width: "100%" }}>
            <UserCheck size={13} style={{ color: "var(--warning)" }} />
            <span style={{ fontSize: "12px", color: "var(--warning)", fontWeight: 500 }}>{dept.hod_name ? dept.hod_name : "Assign HOD"}</span>
          </button>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--border-primary)", paddingTop: "12px", display: "flex", gap: "8px" }}>
        <Link href={`/u/students?department=${dept.id}`} style={{ fontSize: "12px", color: "var(--brand)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: "var(--bg-hover)", borderRadius: "6px", border: "1px solid var(--border-primary)", fontWeight: 500 }}>
          <GraduationCap size={13} /> Students
        </Link>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [hods, setHods] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [filterFac, setFilterFac] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uniId, setUniId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newShortName, setNewShortName] = useState("");
  const [newFacultyId, setNewFacultyId] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<Department | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const facParam = searchParams.get("faculty");
    if (facParam) {
      setFilterFac(facParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase.from("profiles").select("university_id").eq("id", session.user.id).single();
    if (!profile?.university_id) { setLoading(false); return; }

    setUniId(profile.university_id);
    
    try {
      const { data: facData } = await supabase.from("faculties").select("id, name, short_name").eq("university_id", profile.university_id);
      const { data: deptData } = await supabase.from("departments").select("id, name, short_name, faculty, hod_id, created_at").eq("university_id", profile.university_id);
      const staffRes = await fetch(`/api/staff?university_id=${profile.university_id}`);
      const { data: allProfiles } = await staffRes.json();

      const hodData = (allProfiles || []).filter((p: any) => (p.role || "").toLowerCase().trim() === "hod");
      const facShortMap: Record<string, string> = {};
      (facData ?? []).forEach((f: any) => facShortMap[f.short_name] = f.name);
      const hodMap: Record<string, string> = {};
      hodData.forEach((h: any) => hodMap[h.id] = h.full_name);

      setFaculties(facData ?? []);
      setHods(hodData);
      setDepartments((deptData ?? []).map((d: any) => ({
        id: d.id,
        name: d.name,
        short_name: d.short_name,
        faculty_id: d.faculty,
        faculty_name: facShortMap[d.faculty] ?? d.faculty ?? "—",
        hod_id: d.hod_id,
        hod_name: d.hod_id ? (hodMap[d.hod_id] ?? null) : null,
        created_at: d.created_at,
      })));
    } catch (err) { console.error("Data loading failed:", err); }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const selectedFac = faculties.find((f) => f.id === newFacultyId);
      const { error: err } = await supabase.from("departments").insert({
        name: newName.trim(),
        short_name: newShortName.trim().toUpperCase(),
        faculty: selectedFac ? selectedFac.short_name : null,
        university_id: uniId,
      });
      if (err) throw new Error(err.message);
      setShowModal(false);
      loadData();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  }

  async function handleAssignHod(deptId: string, hodId: string) {
    await supabase.from("departments").update({ hod_id: hodId }).eq("id", deptId);
    loadData();
  }

  async function handleDelete(id: string) {
    setConfirmDelete(null);
    setSaving(true);
    await supabase.from("departments").delete().eq("id", id);
    loadData();
    setSaving(false);
  }

  const filtered = departments.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.short_name.toLowerCase().includes(search.toLowerCase());
    const matchFac = !filterFac || d.faculty_id === filterFac;
    return matchSearch && matchFac;
  });

  return (
    <div>
      <ConfirmationModal
        visible={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id)}
        title="Delete Department?"
        message={`Delete ${confirmDelete?.name}?`}
        confirmText="Yes, Delete"
        isDestructive
        isLoading={saving}
        icon={AlertTriangle}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <ArrowLeft size={13} /> Back to Faculties
          </button>
          <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Departments</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={15} /> Add Department
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}><Loader2 size={24} className="animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Building2 size={32} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No departments yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {filtered.map((d) => (
            <DeptCard key={d.id} dept={d} hods={hods} onAssignHod={handleAssignHod} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Add New Department" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <select required value={newFacultyId} onChange={(e) => setNewFacultyId(e.target.value)} className="select" style={{width: "100%"}}>
              <option value="" disabled>Select a faculty...</option>
              {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <input required type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Department Name" className="input" style={{width: "100%"}} />
            <input required type="text" value={newShortName} onChange={(e) => setNewShortName(e.target.value)} placeholder="Short Name" className="input" style={{width: "100%"}} />
            <button type="submit" disabled={saving} className="btn-primary" style={{width: "100%"}}>{saving ? "Creating..." : "Create Department"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
