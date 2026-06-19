"use client";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
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
            Reset Password
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-primary mb-1!">Forgot password?</h2>
          <ForgotPasswordForm loginHref="/login" loginLabel="Back to sign in" />
        </div>
      </div>
    </main>
  );
}