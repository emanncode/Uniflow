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
import { isInAppBrowser } from "@/lib/detect-in-app-browser";

interface ResetPasswordFormProps {
  loginHref: string;
  forgotHref?: string;
  loginLabel?: string;
  badge?: React.ReactNode;
}

function MobileBrowserTip() {
  if (!isInAppBrowser()) return null;

  return (
    <div
      className="mb-5 rounded-lg px-4 py-3 text-left text-sm leading-relaxed"
      style={{
        background: "rgba(255, 92, 26, 0.08)",
        border: "1px solid rgba(255, 92, 26, 0.2)",
        color: "var(--text-secondary)",
      }}
    >
      Open this page in <strong className="text-primary">Chrome</strong> or{" "}
      <strong className="text-primary">Safari</strong> if the reset link does not
      work inside your email app.
    </div>
  );
}

function RecoveryGate({
  state,
  error,
  loginHref,
  forgotHref,
  loginLabel,
  onConfirm,
}: {
  state: RecoveryState;
  error: string;
  loginHref: string;
  forgotHref?: string;
  loginLabel: string;
  onConfirm: () => void;
}) {
  if (state === "loading") {
    return (
      <div className="py-10 text-center">
        <Loader2 size={28} className="animate-spin mx-auto text-brand mb-4" />
        <p className="text-secondary text-sm">Verifying your reset link...</p>
      </div>
    );
  }

  if (state === "confirm") {
    return (
      <div className="text-center">
        <MobileBrowserTip />
        <h2 className="text-xl font-bold text-primary mb-2">Continue reset</h2>
        <p className="text-secondary text-sm leading-relaxed mb-6">
          Tap below to verify your reset link and choose a new password.
        </p>
        <button type="button" onClick={onConfirm} className="btn-primary w-full mb-3">
          Continue to reset password
        </button>
        {forgotHref ? (
          <Link href={forgotHref} className="text-sm text-muted hover:text-primary">
            Request a new link
          </Link>
        ) : (
          <p className="text-xs text-muted leading-relaxed">
            Link expired? Contact your Uniflow administrator for a new reset link.
          </p>
        )}
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="text-center">
        <MobileBrowserTip />
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
        <p className="text-secondary text-xs leading-relaxed mb-6">
          {forgotHref
            ? "Reset links work once and expire after 1 hour. Request a fresh link, then open it on the same device you want to use."
            : "Reset links work once and expire after 1 hour. Contact your Uniflow administrator to request a new link."}
        </p>
        {forgotHref ? (
          <Link href={forgotHref} className="btn-primary inline-block mb-3">
            Request a new link
          </Link>
        ) : null}
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
  forgotHref,
  loginLabel = "Back to sign in",
  badge,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const { state, error: recoveryError, confirmToken } =
    usePasswordRecoverySession();

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
      const message =
        err instanceof Error ? err.message : "Failed to update password.";
      setError(
        /current password|reauthenticate|recovery/i.test(message)
          ? "Your reset link was not verified. Open the link from your email again and tap Continue to reset password before choosing a new one."
          : message,
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
        onConfirm={confirmToken}
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