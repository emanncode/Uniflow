"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useUniversity } from "@/context/UniversityContext";
import {
  FolderOpen,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  File,
} from "lucide-react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

type ResourceType = "past_question" | "note" | "material" | "other";
type FileType = "pdf" | "image" | "doc" | "other";

interface Resource {
  id: string;
  course_id: string;
  uploaded_by: string;
  university_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: FileType;
  resource_type: ResourceType;
  academic_session: string;
  downloads: number;
  is_approved: boolean;
  created_at: string;
  courses?: { code: string; title: string } | null;
}

interface Course {
  id: string;
  code: string;
  title: string;
}

const RESOURCE_TYPES: { value: ResourceType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "past_question", label: "Past Questions" },
  { value: "note", label: "Notes" },
  { value: "material", label: "Materials" },
  { value: "other", label: "Other" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
] as const;

function ResourceTypeIcon({ type }: { type: FileType }) {
  switch (type) {
    case "pdf":
      return <FileText size={14} style={{ color: "var(--danger)" }} />;
    case "image":
      return <ImageIcon size={14} style={{ color: "var(--info)" }} />;
    case "doc":
      return <FileText size={14} style={{ color: "var(--brand)" }} />;
    default:
      return <File size={14} style={{ color: "var(--text-muted)" }} />;
  }
}

function ResourceTypeLabel({ type }: { type: ResourceType }) {
  const labels: Record<ResourceType, string> = {
    past_question: "Past Q",
    note: "Note",
    material: "Material",
    other: "Other",
  };
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--text-muted)",
        background: "var(--bg-hover)",
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {labels[type]}
    </span>
  );
}

export default function ResourcesPage() {
  const { universityId, isReady } = useUniversity();
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterType, setFilterType] = useState<ResourceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<Resource | null>(null);
  const [refreshKey] = useState(0);

  // Fetch courses for filter
  useEffect(() => {
    if (!isReady || !universityId) return;
    supabase
      .from("courses")
      .select("id, code, title")
      .eq("university_id", universityId)
      .eq("is_active", true)
      .order("code")
      .then(({ data }) => {
        if (data) setCourses(data);
      });
  }, [isReady, universityId]);

  // Fetch resources
  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      if (!isReady || !universityId) return;
      setLoading(true);
      setError("");

      const { data, error: err } = await supabase
        .from("resources")
        .select("*, courses!inner(code, title)")
        .eq("university_id", universityId)
        .order("created_at", { ascending: false })
        .limit(200);

      if (cancelled) return;

      if (err) {
        setError(err.message);
      } else {
        setResources((data as unknown as Resource[]) || []);
      }
      setLoading(false);
    }

    loadResources();
    return () => { cancelled = true; };
  }, [isReady, universityId, refreshKey]);

  const filtered = useMemo(() => {
    let result = resources;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.courses?.code.toLowerCase().includes(q) ||
          r.courses?.title.toLowerCase().includes(q)
      );
    }

    if (filterCourse !== "all") {
      result = result.filter((r) => r.course_id === filterCourse);
    }

    if (filterType !== "all") {
      result = result.filter((r) => r.resource_type === filterType);
    }

    if (filterStatus === "approved") {
      result = result.filter((r) => r.is_approved);
    } else if (filterStatus === "pending") {
      result = result.filter((r) => !r.is_approved);
    }

    return result;
  }, [resources, search, filterCourse, filterType, filterStatus]);

  async function handleToggleApproval(resource: Resource) {
    const newVal = !resource.is_approved;
    const { error: err } = await supabase
      .from("resources")
      .update({ is_approved: newVal })
      .eq("id", resource.id);

    if (err) {
      setError(err.message);
      return;
    }
    setResources((prev) =>
      prev.map((r) => (r.id === resource.id ? { ...r, is_approved: newVal } : r))
    );
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    const { error: err } = await supabase
      .from("resources")
      .delete()
      .eq("id", confirmDelete.id);

    if (err) {
      setError(err.message);
      setConfirmDelete(null);
      return;
    }
    setResources((prev) => prev.filter((r) => r.id !== confirmDelete.id));
    setConfirmDelete(null);
  }

  async function handleDownload(resource: Resource) {
    const { error: err } = await supabase
      .from("resources")
      .update({ downloads: resource.downloads + 1 })
      .eq("id", resource.id);

    if (!err) {
      setResources((prev) =>
        prev.map((r) =>
          r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r,
        ),
      );
    }

    const a = document.createElement("a");
    a.href = resource.file_url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Resources
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== resources.length
              ? ` (${resources.length} total)`
              : ""}
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "var(--danger-muted)",
            border: "1px solid var(--danger)",
            color: "var(--danger)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "320px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: "36px" }}
          />
        </div>

        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="input"
          style={{ width: "auto", minWidth: "160px" }}
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.title}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setFilterStatus(s.value)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                fontWeight: 500,
                border: `1px solid ${filterStatus === s.value ? "var(--brand)" : "var(--border-primary)"}`,
                background: filterStatus === s.value ? "var(--brand-muted)" : "transparent",
                color: filterStatus === s.value ? "var(--brand)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all var(--transition)",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Type chips */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {RESOURCE_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setFilterType(t.value)}
            style={{
              padding: "4px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "11px",
              fontWeight: 500,
              border: `1px solid ${filterType === t.value ? "var(--brand)" : "var(--border-primary)"}`,
              background: filterType === t.value ? "var(--brand-muted)" : "transparent",
              color: filterType === t.value ? "var(--brand)" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all var(--transition)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 0",
            gap: "8px",
            color: "var(--text-muted)",
            fontSize: "14px",
          }}
        >
          <Loader2 size={18} className="animate-spin" />
          Loading resources...
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-muted)",
          }}
        >
          <FolderOpen
            size={40}
            style={{
              margin: "0 auto 16px",
              opacity: 0.4,
            }}
          />
          <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-secondary)" }}>
            {resources.length === 0 ? "No resources uploaded yet" : "No resources match your filters"}
          </p>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>
            {resources.length === 0
              ? "Resources uploaded by lecturers will appear here for approval."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      )}

      {/* Resources list */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((resource) => (
            <div
              key={resource.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                transition: "all var(--transition)",
              }}
            >
              {/* File type icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--bg-hover)",
                  border: "1px solid var(--border-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ResourceTypeIcon type={resource.file_type} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {resource.title}
                  </span>
                  <ResourceTypeLabel type={resource.resource_type} />
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Download size={11} />
                    {resource.downloads}
                  </span>
                  {resource.is_approved ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--success)",
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Approved
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--warning)",
                      }}
                    >
                      <XCircle size={12} />
                      Pending
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {resource.courses && (
                    <span style={{ fontWeight: 500 }}>
                      {resource.courses.code} — {resource.courses.title}
                    </span>
                  )}
                  <span>{resource.academic_session}</span>
                  <span>
                    {new Date(resource.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexShrink: 0,
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleToggleApproval(resource)}
                  title={resource.is_approved ? "Revoke approval" : "Approve"}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    background: resource.is_approved
                      ? "var(--warning-muted)"
                      : "var(--success-muted)",
                    color: resource.is_approved
                      ? "var(--warning)"
                      : "var(--success)",
                    transition: "all var(--transition)",
                  }}
                >
                  {resource.is_approved ? "Revoke" : "Approve"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(resource)}
                  title="Download file"
                  style={{
                    padding: "6px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-primary)",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all var(--transition)",
                  }}
                >
                  <Download size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDelete(resource)}
                  title="Delete resource"
                  style={{
                    padding: "6px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-primary)",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all var(--transition)",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        visible={!!confirmDelete}
        title="Delete Resource"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
