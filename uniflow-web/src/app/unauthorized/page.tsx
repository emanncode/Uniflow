"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import UniflowLogo from "@/components/ui/UniflowLogo";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const message =
    reason === "wrong-portal"
      ? "This account belongs to a different university portal. Sign in on the correct subdomain for your institution."
      : "You don't have permission to access this portal. University portals require a university admin account.";

  return (
    <main
      style={{ backgroundColor: "var(--bg-primary)" }}
      className="min-h-screen flex items-center justify-center px-4! relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(var(--bg-hover)_1px,transparent_1px),linear-gradient(90deg,var(--bg-hover)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <div className="relative w-full max-w-md text-center">
        <div className="mb-8! flex justify-center">
          <UniflowLogo size={36} />
        </div>

        <div className="card">
          <h1 className="text-xl font-bold text-primary mb-2!">Unauthorized</h1>
          <p className="text-secondary text-sm mb-6! leading-relaxed">{message}</p>

          <div className="space-y-3">
            <Link href="/login" className="btn-primary w-full inline-block text-center">
              Go to login
            </Link>
            <Link
              href="/"
              className="text-xs text-brand hover:underline inline-block"
            >
              Back to home
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted mt-6! leading-relaxed">
          Local dev: use{" "}
          <code className="text-brand">http://YOURSHORTNAME-admin.localhost:3000</code>
          <br />
          (replace YOURSHORTNAME with the university&apos;s short name from the database)
        </p>
      </div>
    </main>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{ backgroundColor: "var(--bg-primary)" }}
          className="min-h-screen flex items-center justify-center px-4!"
        >
          <div className="text-secondary text-sm">Loading...</div>
        </main>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}