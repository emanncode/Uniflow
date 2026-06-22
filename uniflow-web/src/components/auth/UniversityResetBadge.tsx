import { GraduationCap } from "lucide-react";

export function UniversityResetBadge({
  name,
}: {
  name: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(251,191,36,0.1)",
        border: "1px solid rgba(251,191,36,0.25)",
        borderRadius: "20px",
        padding: "5px 14px",
        margin: "0 auto 12px",
        width: "fit-content",
      }}
    >
      <GraduationCap size={12} style={{ color: "var(--gold)" }} />
      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--gold)" }}>
        {name}
      </span>
    </div>
  );
}