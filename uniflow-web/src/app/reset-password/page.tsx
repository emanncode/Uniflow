"use client";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { UniversityResetBadge } from "@/components/auth/UniversityResetBadge";
import { useUniversityResetContext } from "@/hooks/useUniversityResetContext";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  const { university, loginHref, loginLabel } = useUniversityResetContext();

  return (
    <main
      style={{ backgroundColor: "var(--bg-primary)" }}
      className="min-h-screen flex items-center justify-center px-4! relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(var(--bg-hover)_1px,transparent_1px),linear-gradient(90deg,var(--bg-hover)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-10! text-center">
          <h1 className="text-4xl font-black tracking-tighter text-primary">
            uni<span className="text-brand">flow</span>
          </h1>
          <p className="mt-2! text-xs text-muted tracking-widest uppercase">
            {university ? "University Portal · Set Password" : "Set New Password"}
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
    </main>
  );
}