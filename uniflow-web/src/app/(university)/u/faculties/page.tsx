"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
  AlertCircle,
} from "lucide-react";

interface Faculty {
  id: string;
  name: string;
  short_name: string;
  logo_url: string | null;
  dean_id: string | null;
  dean_name: string | null;
  dept_count: number;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
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
          maxWidth: "480px",
          background: "#0d1525",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "28px",
          maxHeight: "90vh",
          overflowY: "auto",
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
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FacultyCard({
  faculty,
  deans,
  onAssignDean,
  onDelete,
  onLogoUpload,
}: {
  faculty: Faculty;
  deans: Profile[];
  onAssignDean: (facultyId: string, deanId: string) => void;
  onDelete: (id: string) => void;
  onLogoUpload: (id: string, file: File) => Promise<void>;
}) {
  const [assigning, setAssigning] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onLogoUpload(faculty.id, file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor =
          "rgba(37,99,235,0.3)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor =
          "rgba(255,255,255,0.07)")
      }
    >
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
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--brand-muted)",
              border: "1px solid var(--border-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {faculty.logo_url ? (
              <img 
                src={faculty.logo_url} 
                alt={faculty.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <BookOpen size={24} style={{ color: "var(--brand)" }} />
            )}
            
            <label style={{
              position: 'absolute', inset: 0, 
              background: 'rgba(0,0,0,0.5)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: uploading ? 1 : 0, 
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
            className="hover-opacity"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" color="#fff" />
              ) : (
                <Plus size={16} color="#fff" />
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {faculty.name}
            </p>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--brand)",
                background: "var(--brand-muted)",
                border: "1px solid var(--border-brand)",
                borderRadius: "4px",
                padding: "2px 6px",
              }}
            >
              {faculty.short_name}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(faculty.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            flexShrink: 0,
          }}
        >
          <Trash2 size={14} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Building2 size={12} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
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
                  Select a dean...
                </option>
                {deans.map((d) => (
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

      <style>{`
        .hover-opacity:hover { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

export default function FacultiesPage() {
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

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      console.warn("No session found in FacultiesPage loadData");
      return;
    }

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("university_id")
      .eq("id", session.user.id)
      .single();
    
    if (pErr) {
      console.error("Error fetching admin profile:", pErr);
      setLoading(false);
      return;
    }

    if (!profile?.university_id) {
      console.warn("Admin has no university_id");
      setLoading(false);
      return;
    }

    setUniId(profile.university_id);
    console.log("FacultiesPage: Loading data for university:", profile.university_id);

    try {
      // 1. Fetch faculties via Supabase (browser client)
      const { data: facData, error: fErr } = await supabase
        .from("faculties")
        .select(`id, name, short_name, logo_url, dean_id, created_at`)
        .eq("university_id", profile.university_id)
        .order("created_at", { ascending: false });

      if (fErr) console.error("Error fetching faculties:", fErr);

      // 2. Fetch departments via Supabase
      const { data: deptCounts } = await supabase
        .from("departments")
        .select("faculty_id")
        .eq("university_id", profile.university_id);

      const countMap: Record<string, number> = {};
      (deptCounts ?? []).forEach((d) => {
        countMap[d.faculty_id] = (countMap[d.faculty_id] ?? 0) + 1;
      });

      // 3. Fetch staff via API (service role proxy) to bypass RLS
      const staffRes = await fetch(`/api/staff?university_id=${profile.university_id}`)
      const { data: allProfiles, error: sErr } = await staffRes.json()

      if (!staffRes.ok || sErr) throw new Error(sErr || 'Failed to fetch staff via API')

      const deanData = (allProfiles || []).filter(p => (p.role || "").toLowerCase().trim() === "dean");
      console.log(`FacultiesPage: Filtered ${deanData.length} deans via API`);

      const deanMap: Record<string, string> = {};
      deanData.forEach((d) => {
        deanMap[d.id] = d.full_name;
      });

      setFaculties(
        (facData ?? []).map((f) => ({
          id: f.id,
          name: f.name,
          short_name: f.short_name,
          logo_url: f.logo_url,
          dean_id: f.dean_id,
          dean_name: f.dean_id ? (deanMap[f.dean_id] ?? null) : null,
          dept_count: countMap[f.id] ?? 0,
          created_at: f.created_at,
        })),
      );
      setDeans(deanData);
    } catch (err: any) {
      console.error("FacultiesPage: Data loading failed:", err);
    }
    
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
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
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignDean(facultyId: string, deanId: string) {
    await supabase
      .from("faculties")
      .update({ dean_id: deanId })
      .eq("id", facultyId);
    await loadData();
  }

  async function handleLogoUpload(facultyId: string, file: File) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `faculties/${facultyId}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('faculties')
        .update({ logo_url: publicUrl })
        .eq('id', facultyId);

      if (updateError) throw updateError;
      
      await loadData();
    } catch (err: any) {
      alert("Logo upload failed: " + err.message);
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm("Delete this faculty? Departments linked to it may be affected.")
    )
      return;
    await supabase.from("faculties").delete().eq("id", id);
    await loadData();
  }

  const filtered = faculties.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.short_name.toLowerCase().includes(search.toLowerCase()),
  );

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
            Faculties
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {faculties.length}{" "}
            {faculties.length === 1 ? "faculty" : "faculties"} · Manage and
            assign deans
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          <Plus size={15} /> Add Faculty
        </button>
      </div>

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
            border: "1px dashed rgba(255,255,255,0.1)",
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
              onDelete={handleDelete}
              onLogoUpload={handleLogoUpload}
            />
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="Add New Faculty"
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
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                }}
              >
                <AlertCircle size={14} style={{ color: "#ef4444" }} />
                <p style={{ fontSize: "12px", color: "#ef4444" }}>{error}</p>
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
                placeholder="e.g. Faculty of Engineering"
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
                placeholder="e.g. ENG"
                className="input"
                style={{ width: "100%", boxSizing: "border-box" }}
                maxLength={10}
              />
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                Short uppercase identifier used across the system
              </p>
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
                  "Create Faculty"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
