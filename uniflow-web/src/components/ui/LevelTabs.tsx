"use client";

import { formatLevelTab } from "@/lib/course-levels";

const LEVEL_COLORS: Record<number, string> = {
  100: "var(--info)",
  200: "var(--brand)",
  300: "var(--warning)",
  400: "var(--success)",
  500: "var(--danger)",
};

const LEVEL_MUTED_COLORS: Record<number, string> = {
  100: "var(--info-muted)",
  200: "var(--brand-muted)",
  300: "var(--warning-muted)",
  400: "var(--success-muted)",
  500: "var(--danger-muted)",
};

interface LevelTabsProps {
  levels: number[];
  activeLevel: number;
  onChange: (level: number) => void;
  counts?: Record<number, number>;
  size?: "sm" | "md";
}

export default function LevelTabs({
  levels,
  activeLevel,
  onChange,
  counts,
  size = "md",
}: LevelTabsProps) {
  const padding = size === "sm" ? "6px 12px" : "8px 14px";
  const fontSize = size === "sm" ? "12px" : "13px";

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
      }}
    >
      {levels.map((level) => {
        const active = level === activeLevel;
        const color = LEVEL_COLORS[level] ?? "var(--brand)";
        const mutedColor = LEVEL_MUTED_COLORS[level] ?? "var(--brand-muted)";
        const count = counts?.[level] ?? 0;

        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding,
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              border: active
                ? `1px solid ${color}`
                : "1px solid var(--border-primary)",
              background: active ? mutedColor : "transparent",
              fontSize,
              fontWeight: active ? 600 : 400,
              color: active ? color : "var(--text-muted)",
              transition: "all var(--transition)",
            }}
          >
            {formatLevelTab(level)}
            {counts && (
              <span
                style={{
                  fontSize: "11px",
                  background: active
                    ? "rgba(255,255,255,0.08)"
                    : "var(--bg-hover)",
                  borderRadius: "4px",
                  padding: "1px 5px",
                  color: active ? color : "var(--text-muted)",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}