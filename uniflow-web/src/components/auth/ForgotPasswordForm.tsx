"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";

interface ForgotPasswordFormProps {
  loginHref: string;
  subtitle?: string;
  /** When set, shows a back link label (e.g. university portal). */
  loginLabel?: string;
}

export function ForgotPasswordForm({
  loginHref,
  subtitle = "Enter your registered email and we'll send you a reset link.",
  loginLabel = "Back to sign in",
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/public/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset email.");

      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
          }}
        >
          <ShieldCheck size={28} color="#22c55e" />
        </div>
        <h2 className="text-xl font-bold text-primary mb-2">Check your email</h2>
        <p className="text-secondary text-sm leading-relaxed mb-6">
          If <strong className="text-primary">{email}</strong> is registered, we
          sent a password reset link. Open it on this device to choose a new
          password.
        </p>
        <Link href={loginHref} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={15} />
          {loginLabel}
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-secondary text-sm mb-6">{subtitle}</p>

      {error ? <div className="alert-error mb-5!">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="input pl-10!"
              autoComplete="email"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Sending...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              Send reset link
              <ArrowRight size={15} />
            </span>
          )}
        </button>
      </form>

      <Link
        href={loginHref}
        className="mt-6 inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} />
        {loginLabel}
      </Link>
    </>
  );
}