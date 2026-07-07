"use client";

import { AlertTriangle } from "lucide-react";
import { useCapsLock } from "@/hooks/useCapsLock";

export function CapsLockWarning() {
  const capsLock = useCapsLock();

  if (!capsLock) return null;

  return (
    <p
      style={{
        fontSize: "12px",
        color: "var(--warning)",
        marginTop: "6px",
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <AlertTriangle size={13} />
      <span>Caps Lock is on — passwords are case-sensitive</span>
    </p>
  );
}
