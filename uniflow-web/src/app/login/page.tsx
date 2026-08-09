"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { verifyPortalAccess } from "@/lib/verify-portal-client";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { BASE_DOMAIN } from "@/lib/domain";
import UniflowLogo from "@/components/ui/UniflowLogo";
import { CapsLockWarning } from "@/components/ui/CapsLockWarning";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleCredentials = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    // first verify email + password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session?.access_token) {
      setError("Sign in failed. Please try again.");
      setLoading(false);
      return;
    }

    const verifyRes = await verifyPortalAccess(
      data.session.access_token,
      "uniflow_admin",
    );

    if (!verifyRes.ok) {
      const payload = (await verifyRes.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(
        payload?.error === "Access denied"
          ? "Access denied. This portal is for uniflow admins only."
          : "Could not verify your account. Please try again.",
      );
      if (verifyRes.status === 403) {
        await supabase.auth.signOut();
      }
      setLoading(false);
      return;
    }

    // OTP logic disabled temporarily. DO NOT UNCOMMENT YET.
    /*
    // sign out temporarily — they must complete OTP
    await supabase.auth.signOut()

    // send OTP to their email
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // don't create new users
      },
    })

    if (otpError) {
      setError(otpError.message)
      setLoading(false)
      return
    }

    setMessage(`Verification code sent to ${email}`)
    setStep('otp')
    */

    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirectTo") || "/dashboard";
    router.push(redirectTo);
    setLoading(false);
  };

  const handleOtp = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setError("Invalid or expired code. Please try again.");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirectTo") || "/dashboard";
    router.push(redirectTo);
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: undefined,
        data: {},
      },
    });

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setMessage("New code sent to your email.");
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center bg-primary text-primary overflow-hidden relative font-sans p-4"
    >
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
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
          z-index: 1;
        }
        .blueprint-bg-item:hover {
          opacity: var(--blueprint-hover-opacity, 1.0);
        }
      `}</style>

      {/* Grid pattern background */}
      <div 
        style={{
          backgroundImage: "linear-gradient(var(--bg-hover) 1px, transparent 1px), linear-gradient(90deg, var(--bg-hover) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        className="absolute inset-0 z-0 pointer-events-none" 
      />

      {/* Large radial ambient glows */}
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-[#008751]/4 blur-[130px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#00a86b]/4 blur-[130px] pointer-events-none mix-blend-screen" />

      {/* ── Background Blueprints (18 scattered items visible on all screens with responsive scaling) ── */}
      
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
          <circle cx="150" cy="70" r="4" fill="var(--brand, #008751)" />
          <circle cx="150" cy="230" r="4" fill="var(--brand, #008751)" />
          <circle cx="70" cy="150" r="4" fill="var(--brand, #008751)" />
          <circle cx="230" cy="150" r="4" fill="var(--brand, #008751)" />
        </svg>
      </div>

      {/* 4. Server Blocks (Bottom Right) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "4%", right: "3%", width: "clamp(90px, 14vw, 220px)", height: "clamp(90px, 14vw, 220px)", animation: "float-1 13s ease-in-out infinite", animationDelay: "0.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="50" y="40" width="80" height="200" rx="4" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <line x1="50" y1="80" x2="130" y2="80" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="50" y1="120" x2="130" y2="120" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="50" y1="160" x2="130" y2="160" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="50" y1="200" x2="130" y2="200" stroke="var(--brand, #008751)" strokeWidth="1" />
          <circle cx="65" cy="60" r="3" fill="var(--brand, #008751)" />
          <circle cx="80" cy="60" r="3" fill="var(--brand, #008751)" />
          <circle cx="95" cy="60" r="3" fill="var(--brand, #008751)" />
          <rect x="170" y="80" width="80" height="120" rx="4" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="4 2" />
          <path d="M 130,100 L 170,100" stroke="var(--brand, #008751)" strokeWidth="1" />
          <path d="M 130,180 L 170,180" stroke="var(--brand, #008751)" strokeWidth="1" />
        </svg>
      </div>

      {/* 5. Core Engine (Middle Left) */}
      <div className="blueprint-bg-item absolute" style={{ top: "28%", left: "-4%", width: "clamp(80px, 12vw, 180px)", height: "clamp(80px, 12vw, 180px)", animation: "float-3 9s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="80" cy="120" r="25" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="80" cy="120" r="5" stroke="var(--brand, #008751)" strokeWidth="1" />
          <circle cx="160" cy="180" r="40" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="8 4" />
          <circle cx="160" cy="180" r="10" stroke="var(--brand, #008751)" strokeWidth="1" />
          <path d="M 80,95 L 160,140 L 240,180" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 80,145 L 160,220 L 240,260" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="160" y1="50" x2="160" y2="140" stroke="var(--brand, #008751)" strokeWidth="0.75" />
          <rect x="135" y="35" width="50" height="15" rx="2" stroke="var(--brand, #008751)" strokeWidth="0.75" />
          <text x="160" y="45" fill="var(--brand, #008751)" fontSize="6" textAnchor="middle" fontFamily="monospace">CORE_ENGINE</text>
        </svg>
      </div>

      {/* 6. Broadcast Phone (Middle Right) */}
      <div className="blueprint-bg-item absolute" style={{ top: "25%", right: "-4%", width: "clamp(80px, 12vw, 180px)", height: "clamp(80px, 12vw, 180px)", animation: "float-3 10s ease-in-out infinite", animationDelay: "1.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="110" y="80" width="80" height="140" rx="8" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <line x1="130" y1="90" x2="170" y2="90" stroke="var(--brand, #008751)" strokeWidth="1" />
          <circle cx="150" cy="205" r="5" stroke="var(--brand, #008751)" strokeWidth="1" />
          <circle cx="150" cy="150" r="80" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="150" cy="150" r="110" stroke="var(--brand, #008751)" strokeWidth="0.75" strokeDasharray="6 3" />
        </svg>
      </div>

      {/* 7. Assembly Cog (Bottom Middle Left) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "28%", left: "-4%", width: "clamp(80px, 12vw, 180px)", height: "clamp(80px, 12vw, 180px)", animation: "float-1 8s ease-in-out infinite", animationDelay: "2s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="50" stroke="var(--brand, #008751)" strokeWidth="1.5" strokeDasharray="4 2" />
          <circle cx="150" cy="150" r="30" stroke="var(--brand, #008751)" strokeWidth="1" />
          <path d="M 150,90 L 150,210" stroke="var(--brand, #008751)" strokeWidth="1" />
          <path d="M 90,150 L 210,150" stroke="var(--brand, #008751)" strokeWidth="1" />
        </svg>
      </div>

      {/* 8. Circuits (Bottom Middle Right) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "25%", right: "-4%", width: "clamp(80px, 12vw, 180px)", height: "clamp(80px, 12vw, 180px)", animation: "float-2 9s ease-in-out infinite", animationDelay: "1s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 30,50 L 110,50 L 150,110 L 270,110" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 110,50 L 150,0 L 200,0" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="30" cy="50" r="4" fill="var(--brand, #008751)" />
          <circle cx="110" cy="50" r="3" fill="var(--brand, #008751)" />
          <circle cx="150" cy="110" r="3" fill="var(--brand, #008751)" />
          <circle cx="270" cy="110" r="4" fill="var(--brand, #008751)" />
        </svg>
      </div>

      {/* 9. Schedule Chaos (Top Center-Left) */}
      <div className="blueprint-bg-item absolute" style={{ top: "14%", left: "25%", width: "clamp(70px, 10vw, 150px)", height: "clamp(70px, 10vw, 150px)", animation: "float-2 11s ease-in-out infinite", animationDelay: "3s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <line x1="20" y1="20" x2="280" y2="20" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="20" y1="70" x2="280" y2="70" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="20" y1="120" x2="280" y2="120" stroke="var(--brand, #008751)" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="20" y1="170" x2="280" y2="170" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="20" y1="220" x2="280" y2="220" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="40" y1="20" x2="40" y2="220" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="100" y1="20" x2="100" y2="220" stroke="var(--brand, #008751)" strokeWidth="1" />
        </svg>
      </div>

      {/* 10. Overlapping Sheets (Top Center-Right) */}
      <div className="blueprint-bg-item absolute" style={{ top: "10%", right: "24%", width: "clamp(70px, 10vw, 150px)", height: "clamp(70px, 10vw, 150px)", animation: "float-1 8s ease-in-out infinite", animationDelay: "1.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="50" y="50" width="120" height="140" rx="3" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="70" y1="80" x2="150" y2="80" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="70" y1="110" x2="150" y2="110" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
          <rect x="110" y="90" width="120" height="140" rx="3" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="4 2" />
        </svg>
      </div>

      {/* 11. Chaotic Clocks (Bottom Center-Left) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "14%", left: "22%", width: "clamp(70px, 10vw, 160px)", height: "clamp(70px, 10vw, 160px)", animation: "float-3 10s ease-in-out infinite", animationDelay: "2.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="100" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="150" cy="150" r="80" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <circle cx="150" cy="150" r="12" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="150" y1="150" x2="190" y2="100" stroke="var(--brand, #008751)" strokeWidth="2" />
        </svg>
      </div>

      {/* 12. Radar Ring (Bottom Center-Right) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "10%", right: "24%", width: "clamp(70px, 10vw, 150px)", height: "clamp(70px, 10vw, 150px)", animation: "float-3 9s ease-in-out infinite", animationDelay: "0.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="80" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="150" cy="150" r="40" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* 13. Core Engine Cog (Top Center Edge) */}
      <div className="blueprint-bg-item absolute" style={{ top: "1.5%", left: "44%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-1 9s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="50" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="150" cy="150" r="20" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 150,50 L 150,250" stroke="var(--brand, #008751)" strokeWidth="0.75" />
          <path d="M 50,150 L 250,150" stroke="var(--brand, #008751)" strokeWidth="0.75" />
        </svg>
      </div>

      {/* 14. Network Nodes (Bottom Center Edge) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "1.5%", left: "44%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-2 10s ease-in-out infinite", animationDelay: "1s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="100" cy="100" r="10" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <circle cx="200" cy="100" r="10" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <circle cx="150" cy="200" r="15" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <line x1="100" y1="110" x2="150" y2="185" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="200" y1="110" x2="150" y2="185" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="100" y1="100" x2="200" y2="100" stroke="var(--brand, #008751)" strokeWidth="0.75" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* 15. Database Cylinder Small (Middle Left Gap) */}
      <div className="blueprint-bg-item absolute" style={{ top: "44%", left: "20%", width: "clamp(60px, 8vw, 120px)", height: "clamp(60px, 8vw, 120px)", animation: "float-3 12s ease-in-out infinite", animationDelay: "2s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 80,100 C 80,92 140,92 140,100 L 140,140 C 140,148 80,148 80,140 Z" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <path d="M 80,115 C 80,107 140,107 140,115" stroke="var(--brand, #008751)" strokeWidth="0.75" strokeDasharray="2 2" />
          <path d="M 80,130 C 80,122 140,122 140,130" stroke="var(--brand, #008751)" strokeWidth="0.75" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* 16. Overlapping Sheet Small (Middle Right Gap) */}
      <div className="blueprint-bg-item absolute" style={{ top: "44%", right: "20%", width: "clamp(60px, 8vw, 120px)", height: "clamp(60px, 8vw, 120px)", animation: "float-3 8s ease-in-out infinite", animationDelay: "0.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="70" y="70" width="80" height="90" rx="2" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <rect x="110" y="90" width="80" height="90" rx="2" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* 17. Radar Scan Small (Bottom Left Gap) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "44%", left: "20%", width: "clamp(60px, 8vw, 120px)", height: "clamp(60px, 8vw, 120px)", animation: "float-2 11s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="50" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="150" y1="150" x2="185" y2="115" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <circle cx="185" cy="115" r="3" fill="var(--brand, #008751)" />
        </svg>
      </div>

      {/* 18. Circuits Small (Bottom Right Gap) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "44%", right: "20%", width: "clamp(60px, 8vw, 120px)", height: "clamp(60px, 8vw, 120px)", animation: "float-1 9s ease-in-out infinite", animationDelay: "1.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 50,100 L 120,100 L 150,150 L 220,150" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <circle cx="50" cy="100" r="3.5" fill="var(--brand, #008751)" />
          <circle cx="220" cy="150" r="3.5" fill="var(--brand, #008751)" />
        </svg>
      </div>

      {/* 19. Radar Mesh (Top Left Inner) */}
      <div className="blueprint-bg-item absolute" style={{ top: "12%", left: "10%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-1 10s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="70" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="150" y1="40" x2="150" y2="260" stroke="var(--brand, #008751)" strokeWidth="1" />
        </svg>
      </div>

      {/* 20. Dotted Database Cylinder (Top Right Inner) */}
      <div className="blueprint-bg-item absolute" style={{ top: "12%", right: "10%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-2 11s ease-in-out infinite", animationDelay: "0.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 60,80 C 60,70 120,70 120,80 L 120,120 C 120,130 60,130 60,120 Z" stroke="var(--brand, #008751)" strokeWidth="1.25" strokeDasharray="4 2" />
        </svg>
      </div>

      {/* 21. Circuit Board Track (Bottom Left Inner) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "12%", left: "10%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-3 9s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 30,50 L 150,50 L 200,100 L 270,100" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <circle cx="30" cy="50" r="4" fill="var(--brand, #008751)" />
        </svg>
      </div>

      {/* 22. Server Rack (Bottom Right Inner) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "12%", right: "10%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-1 12s ease-in-out infinite", animationDelay: "1s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="50" y="40" width="80" height="150" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <line x1="50" y1="80" x2="130" y2="80" stroke="var(--brand, #008751)" strokeWidth="1" />
        </svg>
      </div>

      {/* 23. Core Engine Cog (Far Left Edge) */}
      <div className="blueprint-bg-item absolute" style={{ top: "48%", left: "-2%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-2 9s ease-in-out infinite", animationDelay: "1.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="40" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <circle cx="150" cy="150" r="20" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* 24. Broadcast Broadcast (Far Right Edge) */}
      <div className="blueprint-bg-item absolute" style={{ top: "48%", right: "-2%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-1 10s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="90" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="6 3" />
        </svg>
      </div>

      {/* 25. Massive Central Node Map (Behind Card Center-Left) */}
      <div className="blueprint-bg-item absolute" style={{ top: "30%", left: "30%", width: "clamp(150px, 20vw, 320px)", height: "clamp(150px, 20vw, 320px)", animation: "float-3 12s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="100" stroke="var(--brand, #008751)" strokeWidth="0.75" strokeDasharray="3 3" />
          <rect x="110" y="110" width="80" height="80" rx="4" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <line x1="150" y1="50" x2="150" y2="110" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="150" y1="190" x2="150" y2="250" stroke="var(--brand, #008751)" strokeWidth="1" />
        </svg>
      </div>

      {/* 26. Massive Central Radar Grid (Behind Card Center-Right) */}
      <div className="blueprint-bg-item absolute" style={{ top: "30%", right: "30%", width: "clamp(150px, 20vw, 320px)", height: "clamp(150px, 20vw, 320px)", animation: "float-2 11s ease-in-out infinite", animationDelay: "2s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="120" stroke="var(--brand, #008751)" strokeWidth="0.75" />
          <circle cx="150" cy="150" r="60" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* ── Central Login Card Container ── */}
      <div className="relative w-full max-w-md z-10">
        
        {/* Header Logo (aligned center above card) */}
        <div className="mb-8 flex flex-col items-center text-center">
          <UniflowLogo size={40} />
          <p className="mt-3 text-[10px] tracking-[0.25em] text-muted uppercase font-bold">
            Admin Portal
          </p>
        </div>

        <div className="bg-card border border-primary rounded-xl p-8 backdrop-blur-md shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          {step === "credentials" ? (
            <>
              <h2 className="text-xl font-bold text-primary tracking-tight mb-2">
                Welcome back
              </h2>
              <p className="text-secondary text-xs mb-8">
                Sign in to manage the Uniflow platform.
              </p>

              {otpError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 text-xs leading-relaxed mb-6">
                  {otpError}
                </div>
              )}

              <div className="space-y-5" aria-busy={loading}>
                <div>
                  <label className="text-xs font-semibold text-secondary tracking-wider uppercase mb-2 block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#008751] transition-colors"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={`admin@${BASE_DOMAIN}`}
                      className="w-full bg-secondary hover:bg-hover focus:bg-secondary border border-primary focus:border-brand rounded-lg pl-12 pr-4 py-3 text-sm text-primary placeholder:text-muted outline-none transition-all duration-200"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-secondary tracking-wider uppercase mb-2 block">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#008751] transition-colors"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-secondary hover:bg-hover focus:bg-secondary border border-primary focus:border-brand rounded-lg pl-12 pr-12 py-3 text-sm text-primary placeholder:text-muted outline-none transition-all duration-200"
                      disabled={loading}
                      autoComplete="current-password"
                      onKeyDown={(e) =>
                        e.key === "Enter" && !loading && handleCredentials()
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <CapsLockWarning />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCredentials}
                  disabled={loading}
                  className="w-full bg-[#008751] hover:bg-[#00a86b] disabled:bg-[#008751]/50 text-white font-bold py-3 px-4 rounded-lg text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(0,135,81,0.2)] hover:shadow-[0_4px_25px_rgba(0,135,81,0.35)] disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  {loading ? "Verifying..." : "Continue"}
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <button
                  onClick={() => {
                    setStep("credentials");
                    setError("");
                    setOtp("");
                  }}
                  disabled={loading}
                  className="text-xs hover:text-brand transition-colors mb-6 flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ← Back
                </button>

                <h2 className="text-xl font-bold text-primary tracking-tight mb-2">
                  Check your email
                </h2>
                <p className="text-secondary text-xs">
                  We sent a 6-digit verification code to{" "}
                  <span className="text-[#00a86b] font-medium">{email}</span>
                </p>
              </div>

              {otpError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 text-xs leading-relaxed mb-6">
                  {otpError}
                </div>
              )}

              {message && (
                <div className="bg-[#008751]/10 border border-[#008751]/20 text-[#00a86b] rounded-lg p-4 text-xs leading-relaxed mb-6">
                  {message}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-secondary tracking-wider uppercase mb-2 block">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full bg-secondary border border-primary focus:border-brand rounded-lg py-4 text-center text-3xl font-bold tracking-[0.4em] pl-[0.4em] text-primary outline-none transition-all duration-200"
                    maxLength={6}
                    disabled={loading}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !loading && handleOtp()
                    }
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-[#008751] hover:bg-[#00a86b] disabled:bg-[#008751]/50 text-white font-bold py-3 px-4 rounded-lg text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(0,135,81,0.2)] hover:shadow-[0_4px_25px_rgba(0,135,81,0.35)] disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {loading ? "Verifying..." : "Verify & Sign in"}
                </motion.button>

                <p className="text-center text-xs text-muted">
                  Didn't receive the code?{" "}
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-[#008751] hover:underline disabled:opacity-50 disabled:pointer-events-none font-medium"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer info (centered bottom) */}
        <p className="text-center text-xs mt-8 text-muted">
          Uniflow Admin Portal © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
