"use client";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { UniversityResetBadge } from "@/components/auth/UniversityResetBadge";
import { useUniversityResetContext } from "@/hooks/useUniversityResetContext";
import ThemeToggle from "@/components/ThemeToggle";

const UniflowBlueprints = () => (
  <>
    <style>{`
      @keyframes float-1 {
        0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
        50% { transform: translateY(-8px) scale(1.01) rotate(1deg); }
      }
      @keyframes float-2 {
        0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
        50% { transform: translateY(8px) scale(0.99) rotate(-1deg); }
      }
      @keyframes float-3 {
        0%, 100% { transform: translateX(0px) translateY(0px); }
        50% { transform: translateX(-5px) translateY(-5px); }
      }
      .blueprint-bg-item {
        opacity: var(--blueprint-opacity, 0.85);
        transition: opacity 0.4s ease, transform 0.4s ease;
        pointer-events: none;
        z-index: 0;
      }
    `}</style>

    {/* 1. DB Hub (Top Left) */}
    <div className="blueprint-bg-item absolute" style={{ top: "3%", left: "3%", width: "clamp(100px, 15vw, 240px)", height: "clamp(100px, 15vw, 240px)", animation: "float-1 10s ease-in-out infinite" }}>
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <rect x="110" y="20" width="80" height="40" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <line x1="110" y1="40" x2="190" y2="40" stroke="var(--brand, #008751)" strokeWidth="1" />
        <text x="150" y="34" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">DB_HUB</text>
        <path d="M 150,60 L 150,120" stroke="var(--brand, #008751)" strokeWidth="1" />
        <path d="M 150,100 L 50,100 L 50,140" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M 150,100 L 250,100 L 250,140" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="20" y="140" width="60" height="40" rx="3" stroke="var(--brand, #008751)" strokeWidth="1" />
        <text x="50" y="152" fill="var(--brand, #008751)" fontSize="6" textAnchor="middle" fontFamily="monospace">STUDENTS</text>
        <line x1="20" y1="158" x2="80" y2="158" stroke="var(--brand, #008751)" strokeWidth="0.5" />
        <rect x="120" y="120" width="60" height="40" rx="3" stroke="var(--brand, #008751)" strokeWidth="1" />
        <text x="150" y="132" fill="var(--brand, #008751)" fontSize="6" textAnchor="middle" fontFamily="monospace">COURSES</text>
        <line x1="120" y1="138" x2="180" y2="138" stroke="var(--brand, #008751)" strokeWidth="0.5" />
        <rect x="220" y="140" width="60" height="40" rx="3" stroke="var(--brand, #008751)" strokeWidth="1" />
        <text x="250" y="152" fill="var(--brand, #008751)" fontSize="6" textAnchor="middle" fontFamily="monospace">VENUE_MAP</text>
        <line x1="220" y1="158" x2="280" y2="158" stroke="var(--brand, #008751)" strokeWidth="0.5" />
      </svg>
    </div>

    {/* 2. DB Cylinders (Top Right) */}
    <div className="blueprint-bg-item absolute" style={{ top: "4%", right: "3%", width: "clamp(90px, 14vw, 220px)", height: "clamp(90px, 14vw, 220px)", animation: "float-2 12s ease-in-out infinite" }}>
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <path d="M 60,80 C 60,70 120,70 120,80 L 120,120 C 120,130 60,130 60,120 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <path d="M 60,95 C 60,85 120,85 120,95" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 60,110 C 60,100 120,100 120,110" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 180,140 C 180,130 240,130 240,140 L 240,180 C 240,190 180,190 180,180 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <path d="M 180,155 C 180,145 240,145 240,155" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 180,170 C 180,160 240,160 240,170" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 120,100 L 150,100 L 150,160 L 180,160" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    </div>

    {/* 3. Radar (Bottom Left) */}
    <div className="blueprint-bg-item absolute" style={{ bottom: "3%", left: "3%", width: "clamp(100px, 15vw, 230px)", height: "clamp(100px, 15vw, 230px)", animation: "float-2 11s ease-in-out infinite", animationDelay: "1s" }}>
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <circle cx="150" cy="150" r="80" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="150" cy="150" r="110" stroke="var(--brand, #008751)" strokeWidth="0.75" />
        <path d="M 40,150 L 260,150" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="6 4" />
        <path d="M 150,40 L 150,260" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="6 4" />
      </svg>
    </div>

    {/* 4. Server Blocks (Bottom Right) */}
    <div className="blueprint-bg-item absolute" style={{ bottom: "4%", right: "3%", width: "clamp(90px, 14vw, 220px)", height: "clamp(90px, 14vw, 220px)", animation: "float-1 13s ease-in-out infinite", animationDelay: "0.5s" }}>
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <rect x="50" y="40" width="200" height="50" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <rect x="50" y="110" width="200" height="50" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <rect x="50" y="180" width="200" height="50" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        <circle cx="75" cy="65" r="5" fill="var(--brand, #008751)" />
        <circle cx="75" cy="135" r="5" fill="var(--brand, #008751)" />
        <circle cx="75" cy="205" r="5" fill="var(--brand, #008751)" />
      </svg>
    </div>
  </>
);

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  const { university, loginHref, loginLabel } = useUniversityResetContext();

  return (
    <main
      style={{ backgroundColor: "var(--bg-primary)" }}
      className="min-h-screen flex items-center justify-center px-4! relative overflow-hidden"
    >
      <UniflowBlueprints />
      <div className="absolute inset-0 bg-[linear-gradient(var(--bg-hover)_1px,transparent_1px),linear-gradient(90deg,var(--bg-hover)_1px,transparent_1px)] bg-size-[64px_64px] pointer-events-none" />

      {/* Floating ThemeToggle */}
      <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 50 }}>
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md z-10">
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