"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryClient";
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
  Image,
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
      return <Image size={14} style={{ color: "var(--info)" }} />;
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
  const queryClient = useQueryClient();
  const { universityId, isReady } = useUniversity();
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterType, setFilterType] = useState<ResourceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<Resource | null>(null);

  const enabled = isReady && !!universityId;

  const { data: resources = [], isLoading } = useQuery({
    queryKey: queryKeys.resources(universityId ?? undefined),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*, courses!inner(code, title)")
        .eq("university_id", universityId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data as unknown as Resource[]) ?? [];
    },
    enabled,
  });

  const { data: courses = [] } = useQuery({
    queryKey: queryKeys.courses({ university_id: universityId, is_active: true }),
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, code, title")
        .eq("university_id", universityId)
        .eq("is_active", true)
        .order("code");
      return (data as Course[]) ?? [];
    },
    enabled,
  });

  const resourceKey = queryKeys.resources(universityId ?? undefined);

  const toggleApproval = useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => {
      const newVal = !is_approved;
      const { error } = await supabase
        .from("resources")
        .update({ is_approved: newVal })
        .eq("id", id);
      if (error) throw error;
      return { id, newVal };
    },
    onMutate: async ({ id, is_approved }) => {
      await queryClient.cancelQueries({ queryKey: resourceKey });
      const prev = queryClient.getQueryData<Resource[]>(resourceKey);
      queryClient.setQueryData<Resource[]>(resourceKey, (old) =>
        old?.map((r) => (r.id === id ? { ...r, is_approved: !is_approved } : r)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(resourceKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: resourceKey }),
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: resourceKey });
      const prev = queryClient.getQueryData<Resource[]>(resourceKey);
      queryClient.setQueryData<Resource[]>(resourceKey, (old) =>
        old?.filter((r) => r.id !== id),
      );
      setConfirmDelete(null);
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(resourceKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: resourceKey }),
  });

  const downloadResource = useMutation({
    mutationFn: async (resource: Resource) => {
      const { error } = await supabase
        .from("resources")
        .update({ downloads: resource.downloads + 1 })
        .eq("id", resource.id);
      if (error) throw error;
      return resource.id;
    },
    onMutate: async (resource) => {
      await queryClient.cancelQueries({ queryKey: resourceKey });
      const prev = queryClient.getQueryData<Resource[]>(resourceKey);
      queryClient.setQueryData<Resource[]>(resourceKey, (old) =>
        old?.map((r) =>
          r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r,
        ),
      );
      return { prev };
    },
    onError: (_err, _resource, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(resourceKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: resourceKey }),
  });

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

  async function handleDownloadClick(resource: Resource) {
    downloadResource.mutate(resource);
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

      {toggleApproval.error || deleteResource.error ? (
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
          {toggleApproval.error?.message || deleteResource.error?.message}
        </div>
      ) : null}

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
      {isLoading && (
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
      {!isLoading && filtered.length === 0 && (
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
      {!isLoading && filtered.length > 0 && (
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
                  onClick={() => toggleApproval.mutate(resource)}
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
                  onClick={() => handleDownloadClick(resource)}
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
                onConfirm={() => deleteResource.mutate(confirmDelete!.id)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
