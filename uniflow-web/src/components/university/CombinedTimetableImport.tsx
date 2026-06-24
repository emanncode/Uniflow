"use client";

import { useState } from "react";
import { Download, Loader2, Upload, Users } from "lucide-react";
import { combinedCsvTemplate } from "@/lib/combined-timetable-csv";

type PreviewRow = {
  line: number;
  course_code: string;
  lecturer_email: string;
  has_schedule: boolean;
  status: "ok" | "error" | "warning";
  message?: string;
};

type Props = {
  universityId: string;
  departmentId: string;
  departmentLabel?: string;
  onComplete: () => void;
};

export function CombinedTimetableImport({
  universityId,
  departmentId,
  departmentLabel,
  onComplete,
}: Props) {
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function downloadTemplate() {
    const blob = new Blob([combinedCsvTemplate()], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${departmentLabel ?? "dept"}_combined_timetable.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function runImport(text: string, mode: "preview" | "commit") {
    setImporting(true);
    setErrors([]);
    if (mode === "preview") {
      setPreview(null);
      setSummary(null);
    }

    try {
      const res = await fetch("/api/timetable/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university_id: universityId,
          department_id: departmentId,
          csv_text: text,
          mode,
          auto_enroll: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");

      if (mode === "preview") {
        setCsvText(text);
        setPreview(data.rows ?? []);
        if (data.error_count > 0) {
          setErrors(
            (data.rows ?? [])
              .filter((r: PreviewRow) => r.status === "error")
              .map((r: PreviewRow) => `Line ${r.line}: ${r.message}`),
          );
        }
        return;
      }

      const enroll = data.auto_enroll;
      setSummary(
        `Imported ${data.offerings_upserted} offering(s), ${data.slots_upserted} slot(s). ` +
          `Auto-enrolled ${enroll?.enrollments_created ?? 0} student(s).`,
      );
      setPreview(null);
      setCsvText(null);
      onComplete();
    } catch (e: unknown) {
      setErrors([e instanceof Error ? e.message : "Import failed"]);
    } finally {
      setImporting(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await runImport(text, "preview");
    e.target.value = "";
  }

  return (
    <div
      style={{
        border: "1px solid rgba(99,102,241,0.25)",
        background: "var(--brand-muted)",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "20px",
      }}
    >
      <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
        Combined import (recommended)
      </p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.5 }}>
        One CSV for courses, lecturers, schedule, and student auto-enrollment. Rows without day/time create
        offerings only; repeat course_code + lecturer_email for multiple slots (lecture + lab).
      </p>

      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: preview ? "12px" : 0 }}>
        <button type="button" onClick={downloadTemplate} className="btn-secondary" style={{ fontSize: "13px" }}>
          <Download size={13} /> Template
        </button>
        <label style={{ cursor: importing ? "not-allowed" : "pointer" }}>
          <input type="file" accept=".csv" onChange={handleFile} style={{ display: "none" }} disabled={importing} />
          <span className="btn-secondary" style={{ fontSize: "13px", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {importing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            Upload CSV
          </span>
        </label>
        {preview && csvText && errors.length === 0 ? (
          <button
            type="button"
            className="btn-primary"
            style={{ fontSize: "13px" }}
            disabled={importing}
            onClick={() => runImport(csvText, "commit")}
          >
            <Users size={13} /> Confirm &amp; auto-enroll students
          </button>
        ) : null}
      </div>

      {summary ? (
        <p style={{ fontSize: "12px", color: "var(--success)", marginTop: "8px" }}>{summary}</p>
      ) : null}

      {errors.length > 0 ? (
        <div className="alert-error" style={{ marginTop: "12px", fontSize: "12px" }}>
          {errors.slice(0, 8).map((err) => (
            <div key={err}>{err}</div>
          ))}
        </div>
      ) : null}

      {preview && preview.length > 0 && errors.length === 0 ? (
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
          Preview: {preview.filter((r) => r.status === "ok").length} slot row(s),{" "}
          {preview.filter((r) => r.status === "warning").length} offering-only row(s). Confirm to apply.
        </p>
      ) : null}
    </div>
  );
}