"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSubdomain } from "@/lib/subdomain";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function UniversityForgotPasswordPage() {
  const [university, setUniversity] = useState<{
    name: string;
    short_name: string;
  } | null>(null);

  useEffect(() => {
    async function detectUniversity() {
      const subdomain = getSubdomain(window.location.hostname);
      if (!subdomain) return;

      const shortName = subdomain.replace("-admin", "");
      const { data } = await supabase
        .from("universities")
        .select("name, short_name")
        .eq("short_name", shortName)
        .eq("status", "approved")
        .single();

      if (data) setUniversity(data);
    }
    detectUniversity();
  }, []);

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
            Reset Password
          </p>
          {university ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.25)",
                borderRadius: "20px",
                padding: "5px 14px",
                marginTop: "12px",
              }}
            >
              <GraduationCap size={12} style={{ color: "var(--gold)" }} />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--gold)",
                }}
              >
                {university.name}
              </span>
            </div>
          ) : null}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-primary mb-1!">
            Forgot password?
          </h2>
          <ForgotPasswordForm
            loginHref="/u/login"
            loginLabel="Back to portal sign in"
          />
        </div>
      </div>
    </div>
  );
}