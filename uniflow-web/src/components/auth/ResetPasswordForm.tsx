"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  usePasswordRecoverySession,
  type RecoveryState,
} from "@/hooks/usePasswordRecoverySession";

interface ResetPasswordFormProps {
  loginHref: string;
  forgotHref?: string;
  loginLabel?: string;
  badge?: React.ReactNode;
}

function RecoveryGate({
  state,
  error,
  loginHref,
  forgotHref,
  loginLabel,
}: {
  state: RecoveryState;
  error: string;
  loginHref: string;
  forgotHref: string;
  loginLabel: string;
}) {
  if (state === "loading") {
    return (
      <div className="py-10 text-center">
        <Loader2 size={28} className="animate-spin mx-auto text-brand mb-4" />
        <p className="text-secondary text-sm">Verifying your reset link...</p>
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <AlertCircle size={28} color="#ef4444" />
        </div>
        <h2 className="text-xl font-bold text-primary mb-2">Link expired</h2>
        <p className="text-secondary text-sm leading-relaxed mb-6">{error}</p>
        <Link href={forgotHref} className="btn-primary inline-block mb-3">
          Request a new link
        </Link>
        <br />
        <Link href={loginHref} className="text-sm text-muted hover:text-primary">
          {loginLabel}
        </Link>
      </div>
    );
  }

  return null;
}

export function ResetPasswordForm({
  loginHref,
  forgotHref = "/forgot-password",
  loginLabel = "Back to sign in",
  badge,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const { state, error: recoveryError } = usePasswordRecoverySession();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      await supabase.auth.signOut();
      setSuccess(true);
      setTimeout(() => router.push(loginHref), 2500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update password.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (state !== "ready") {
    return (
      <RecoveryGate
        state={state}
        error={recoveryError}
        loginHref={loginHref}
        forgotHref={forgotHref}
        loginLabel={loginLabel}
      />
    );
  }

  if (success) {
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
        <h2 className="text-xl font-bold text-primary mb-2">Password updated</h2>
        <p className="text-secondary text-sm">
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  return (
    <>
      {badge}

      <p className="text-secondary text-sm mb-6 text-center">
        Choose a new secure password for your account.
      </p>

      {error ? <div className="alert-error mb-5!">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">New password</label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-10! pr-10!"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Confirm password</label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-10! pr-10!"
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Updating...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              Update password
              <ArrowRight size={15} />
            </span>
          )}
        </button>
      </form>
    </>
  );
}