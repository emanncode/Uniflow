"use client";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { UniversityResetBadge } from "@/components/auth/UniversityResetBadge";
import { useUniversityResetContext } from "@/hooks/useUniversityResetContext";

export default function UniversityResetPasswordPage() {
  const { university, loginHref, loginLabel } = useUniversityResetContext();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 className="text-4xl font-black tracking-tighter text-primary">
            uni<span className="text-brand">flow</span>
          </h1>
          <p className="mt-2! text-xs text-muted tracking-widest uppercase">
            University Portal · Set Password
          </p>
          {university ? <UniversityResetBadge name={university.name} /> : null}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-primary mb-1! text-center">
            Choose a new password
          </h2>
          <ResetPasswordForm loginHref={loginHref} loginLabel={loginLabel} />
        </div>
      </div>
    </div>
  );
}