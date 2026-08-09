"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { verifyPortalAccess } from "@/lib/verify-portal-client";
import { getSubdomain } from "@/lib/subdomain";
import { Eye, EyeOff, Mail, Lock, GraduationCap } from "lucide-react";
import UniflowLogo from "@/components/ui/UniflowLogo";
import { CapsLockWarning } from "@/components/ui/CapsLockWarning";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default function UniversityLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [university, setUniversity] = useState<{ name: string; short_name: string } | null>(null);

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

  const handleCredentials = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw new Error("Invalid email or password.");
      if (!data.session?.access_token) {
        throw new Error("Sign in failed. Please try again.");
      }

      const verifyRes = await verifyPortalAccess(
        data.session.access_token,
        "university_admin",
      );

      if (!verifyRes.ok) {
        const payload = (await verifyRes.json().catch(() => null)) as {
          error?: string;
        } | null;
        if (verifyRes.status === 403) {
          await supabase.auth.signOut();
        }
        throw new Error(
          payload?.error === "Access denied"
            ? "Only university admin accounts can access this portal."
            : "Could not verify your account. Please try again.",
        );
      }

      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo") || "/u";
      router.push(redirectTo);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
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

      {/* ── Background Blueprints (18 university-themed scattered items) ── */}
      
      {/* 1. Graduation Cap (Top Left) */}
      <div className="blueprint-bg-item absolute" style={{ top: "3%", left: "3%", width: "clamp(100px, 15vw, 240px)", height: "clamp(100px, 15vw, 240px)", animation: "float-1 10s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 150,50 L 250,100 L 150,150 L 50,100 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 100,125 L 100,180 C 100,200 200,200 200,180 L 200,125" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 210,110 L 250,160 L 250,220" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="250" cy="220" r="4" fill="var(--brand, #008751)" />
          <text x="150" y="85" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">GRAD_CAP</text>
        </svg>
      </div>

      {/* 2. Open Book (Top Right) */}
      <div className="blueprint-bg-item absolute" style={{ top: "4%", right: "3%", width: "clamp(90px, 14vw, 220px)", height: "clamp(90px, 14vw, 220px)", animation: "float-2 12s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 150,220 C 120,200 60,200 30,220 L 30,80 C 60,60 120,60 150,80 C 180,60 240,60 270,80 L 270,220 C 240,200 180,200 150,220 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 150,80 L 150,220" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 50,105 L 130,105" stroke="var(--brand, #008751)" strokeWidth="0.75" strokeDasharray="2 2" />
          <path d="M 50,135 L 130,135" stroke="var(--brand, #008751)" strokeWidth="0.75" strokeDasharray="2 2" />
          <path d="M 170,105 L 250,105" stroke="var(--brand, #008751)" strokeWidth="0.75" strokeDasharray="2 2" />
          <path d="M 170,135 L 250,135" stroke="var(--brand, #008751)" strokeWidth="0.75" strokeDasharray="2 2" />
          <text x="150" y="50" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">LIB_BOOK</text>
        </svg>
      </div>

      {/* 3. Trophy Achievement (Bottom Left) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "3%", left: "3%", width: "clamp(100px, 15vw, 230px)", height: "clamp(100px, 15vw, 230px)", animation: "float-2 11s ease-in-out infinite", animationDelay: "1s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 90,80 L 210,80 L 210,140 C 210,180 180,200 150,200 C 120,200 90,180 90,140 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 150,200 L 150,240" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 110,240 L 190,240" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 90,100 H 60 C 50,100 50,140 60,140 H 90" stroke="var(--brand, #008751)" strokeWidth="1" />
          <path d="M 210,100 H 240 C 250,100 250,140 240,140 H 210" stroke="var(--brand, #008751)" strokeWidth="1" />
          <text x="150" y="65" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">ACHIEVEMENT</text>
        </svg>
      </div>

      {/* 4. University Hall Columns (Bottom Right) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "4%", right: "3%", width: "clamp(90px, 14vw, 220px)", height: "clamp(90px, 14vw, 220px)", animation: "float-1 13s ease-in-out infinite", animationDelay: "0.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 40,240 H 260 M 40,220 H 260 M 60,80 L 150,30 L 240,80 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <rect x="75" y="100" width="20" height="120" stroke="var(--brand, #008751)" strokeWidth="1" />
          <rect x="115" y="100" width="20" height="120" stroke="var(--brand, #008751)" strokeWidth="1" />
          <rect x="165" y="100" width="20" height="120" stroke="var(--brand, #008751)" strokeWidth="1" />
          <rect x="205" y="100" width="20" height="120" stroke="var(--brand, #008751)" strokeWidth="1" />
          <text x="150" y="270" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">FACULTY_HALL</text>
        </svg>
      </div>

      {/* 5. Atom Science (Middle Left) */}
      <div className="blueprint-bg-item absolute" style={{ top: "28%", left: "-4%", width: "clamp(80px, 12vw, 180px)", height: "clamp(80px, 12vw, 180px)", animation: "float-3 9s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <ellipse cx="150" cy="150" rx="110" ry="40" transform="rotate(30 150 150)" stroke="var(--brand, #008751)" strokeWidth="1" />
          <ellipse cx="150" cy="150" rx="110" ry="40" transform="rotate(-30 150 150)" stroke="var(--brand, #008751)" strokeWidth="1" />
          <circle cx="150" cy="150" r="15" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <circle cx="210" cy="85" r="4" fill="var(--brand, #008751)" />
          <text x="150" y="25" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">SCIENCE_DEPT</text>
        </svg>
      </div>

      {/* 6. Globe Geography (Middle Right) */}
      <div className="blueprint-bg-item absolute" style={{ top: "25%", right: "-4%", width: "clamp(80px, 12vw, 180px)", height: "clamp(80px, 12vw, 180px)", animation: "float-3 10s ease-in-out infinite", animationDelay: "1.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="90" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <ellipse cx="150" cy="150" rx="90" ry="30" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="60" y1="150" x2="240" y2="150" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <line x1="150" y1="60" x2="150" y2="240" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <text x="150" y="35" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">GLOBAL_STUDIES</text>
        </svg>
      </div>

      {/* 7. Certificate Diploma (Bottom Middle Left) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "28%", left: "-4%", width: "clamp(80px, 12vw, 180px)", height: "clamp(80px, 12vw, 180px)", animation: "float-1 8s ease-in-out infinite", animationDelay: "2s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="40" y="50" width="220" height="170" rx="4" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <rect x="52" y="62" width="196" height="146" rx="2" stroke="var(--brand, #008751)" strokeWidth="0.75" strokeDasharray="3 3" />
          <text x="150" y="100" fill="var(--brand, #008751)" fontSize="12" textAnchor="middle" fontFamily="serif" fontWeight="bold">DIPLOMA</text>
          <line x1="80" y1="135" x2="220" y2="135" stroke="var(--brand, #008751)" strokeWidth="1" />
          <circle cx="150" cy="170" r="12" stroke="var(--brand, #008751)" strokeWidth="1.25" />
        </svg>
      </div>

      {/* 8. Timetable Schedule (Bottom Middle Right) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "25%", right: "-4%", width: "clamp(80px, 12vw, 180px)", height: "clamp(80px, 12vw, 180px)", animation: "float-2 9s ease-in-out infinite", animationDelay: "1s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="50" y="60" width="200" height="170" rx="6" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <line x1="50" y1="100" x2="250" y2="100" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <circle cx="90" cy="80" r="6" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <circle cx="210" cy="80" r="6" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <line x1="100" y1="130" x2="200" y2="130" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="100" y1="160" x2="200" y2="160" stroke="var(--brand, #008751)" strokeWidth="1" />
          <text x="150" y="45" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">TIMETABLE</text>
        </svg>
      </div>

      {/* 9. Innovate Lightbulb (Top Center-Left) */}
      <div className="blueprint-bg-item absolute" style={{ top: "14%", left: "25%", width: "clamp(70px, 10vw, 150px)", height: "clamp(70px, 10vw, 150px)", animation: "float-2 11s ease-in-out infinite", animationDelay: "3s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 150,220 C 130,220 100,195 100,140 C 100,90 140,70 150,70 C 160,70 200,90 200,140 C 200,195 170,220 150,220 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <rect x="130" y="220" width="40" height="15" rx="2" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 150,100 L 150,140 M 130,120 L 170,120" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="150" y="45" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">INNOVATE</text>
        </svg>
      </div>

      {/* 10. Student Cap Portrait (Top Center-Right) */}
      <div className="blueprint-bg-item absolute" style={{ top: "10%", right: "24%", width: "clamp(70px, 10vw, 150px)", height: "clamp(70px, 10vw, 150px)", animation: "float-1 8s ease-in-out infinite", animationDelay: "1.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="110" r="40" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 80,220 C 80,180 110,160 150,160 C 190,160 220,180 220,220 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <text x="150" y="30" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">STUDENTS</text>
        </svg>
      </div>

      {/* 11. Honors Ribbon (Bottom Center-Left) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "14%", left: "22%", width: "clamp(70px, 10vw, 160px)", height: "clamp(70px, 10vw, 160px)", animation: "float-3 10s ease-in-out infinite", animationDelay: "2.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="110" r="50" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <path d="M 135,155 L 115,240 L 150,220 L 185,240 L 165,155" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <text x="150" y="45" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">HONORS</text>
        </svg>
      </div>

      {/* 12. Ruler & Compass (Bottom Center-Right) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "10%", right: "24%", width: "clamp(70px, 10vw, 150px)", height: "clamp(70px, 10vw, 150px)", animation: "float-3 9s ease-in-out infinite", animationDelay: "0.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 150,50 L 100,210 M 150,50 L 200,210" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <rect x="50" y="220" width="200" height="20" rx="2" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="110" y1="220" x2="110" y2="235" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <line x1="170" y1="220" x2="170" y2="235" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <text x="150" y="270" fill="var(--brand, #008751)" fontSize="8" textAnchor="middle" fontFamily="monospace">ENGINEERING</text>
        </svg>
      </div>

      {/* 13. Compass Logo Edge (Top Center Edge) */}
      <div className="blueprint-bg-item absolute" style={{ top: "1.5%", left: "44%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-1 9s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="50" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="150" cy="150" r="20" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* 14. Global Node Map (Bottom Center Edge) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "1.5%", left: "44%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-2 10s ease-in-out infinite", animationDelay: "1s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="100" cy="100" r="10" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <circle cx="200" cy="100" r="10" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <circle cx="150" cy="200" r="15" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <line x1="100" y1="110" x2="150" y2="185" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="200" y1="110" x2="150" y2="185" stroke="var(--brand, #008751)" strokeWidth="1" />
        </svg>
      </div>

      {/* 15. Mini Beaker Flask (Middle Left Gap) */}
      <div className="blueprint-bg-item absolute" style={{ top: "44%", left: "20%", width: "clamp(60px, 8vw, 120px)", height: "clamp(60px, 8vw, 120px)", animation: "float-3 12s ease-in-out infinite", animationDelay: "2s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 120,80 H 180 M 140,80 V 130 L 90,220 H 210 L 160,130 V 80" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <line x1="110" y1="180" x2="190" y2="180" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* 16. Stacked Books (Middle Right Gap) */}
      <div className="blueprint-bg-item absolute" style={{ top: "44%", right: "20%", width: "clamp(60px, 8vw, 120px)", height: "clamp(60px, 8vw, 120px)", animation: "float-3 8s ease-in-out infinite", animationDelay: "0.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="60" y="80" width="140" height="30" rx="2" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <rect x="80" y="115" width="140" height="35" rx="2" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <rect x="70" y="155" width="150" height="40" rx="2" stroke="var(--brand, #008751)" strokeWidth="1.25" />
        </svg>
      </div>

      {/* 17. DNA Helix (Bottom Left Gap) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "44%", left: "20%", width: "clamp(60px, 8vw, 120px)", height: "clamp(60px, 8vw, 120px)", animation: "float-2 11s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 100,60 Q 150,150 200,240 M 200,60 Q 150,150 100,240" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          <line x1="110" y1="90" x2="190" y2="90" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="125" y1="120" x2="175" y2="120" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="125" y1="180" x2="175" y2="180" stroke="var(--brand, #008751)" strokeWidth="1" />
          <line x1="110" y1="210" x2="190" y2="210" stroke="var(--brand, #008751)" strokeWidth="1" />
        </svg>
      </div>

      {/* 18. Radar Compass (Bottom Right Gap) */}
      <div className="blueprint-bg-item absolute" style={{ bottom: "44%", right: "20%", width: "clamp(60px, 8vw, 120px)", height: "clamp(60px, 8vw, 120px)", animation: "float-1 9s ease-in-out infinite", animationDelay: "1.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="60" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          <path d="M 150,110 L 165,150 L 150,190 L 135,150 Z" stroke="var(--brand, #008751)" strokeWidth="1.25" />
        </svg>
      </div>

      {/* ── Central Login Card Container ── */}
      <div className="relative w-full max-w-md z-10">
        
        {/* Header Logo (aligned center above card) */}
        <div className="mb-8 flex flex-col items-center text-center">
          <UniflowLogo size={40} />
          <p className="mt-3 text-[10px] tracking-[0.25em] text-muted uppercase font-bold">
            University Portal
          </p>

          {university && (
            <div
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-1.5 rounded-full"
              style={{
                background: "var(--warning-muted)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <GraduationCap size={14} style={{ color: "var(--warning)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--warning)" }}>
                {university.name}
              </span>
            </div>
          )}
        </div>

        <div className="bg-card border border-primary rounded-xl p-8 backdrop-blur-md shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-primary tracking-tight mb-2">
            Welcome back
          </h2>
          <p className="text-secondary text-xs mb-8">
            Sign in to manage your university.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 text-xs leading-relaxed mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleCredentials} className="space-y-5" aria-busy={loading}>
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
                  placeholder="you@university.edu"
                  className="w-full bg-secondary hover:bg-hover focus:bg-secondary border border-primary focus:border-brand rounded-lg pl-12 pr-4 py-3 text-sm text-primary placeholder:text-muted outline-none transition-all duration-200"
                  disabled={loading}
                  required
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
                  required
                  autoComplete="current-password"
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
              type="submit"
              disabled={loading}
              className="w-full bg-[#008751] hover:bg-[#00a86b] disabled:bg-[#008751]/50 text-white font-bold py-3 px-4 rounded-lg text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(0,135,81,0.2)] hover:shadow-[0_4px_25px_rgba(0,135,81,0.35)] disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {loading ? "Verifying..." : "Continue"}
            </motion.button>
          </form>
        </div>

        {/* Footer info (centered bottom) */}
        <p className="text-center text-xs mt-8 text-muted">
          Uniflow © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}