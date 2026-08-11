"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { UniversityProvider } from "@/context/UniversityContext";
import UniflowLogo from "@/components/ui/UniflowLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import InactivityWarningDialog from "@/components/ui/InactivityWarningDialog";
import {
  isUniversityNavActive,
  isUniversityPublicPath,
  universityPortalLoginPath,
} from "@/lib/university-portal-path";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  Menu,
  Bell,
  Settings,
  FolderOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

// ─── Role-based nav config ───────────────────────────────────────────────────

type Role = "university_admin";

const NAV_ITEMS: {
  label: string;
  href: string;
  icon: React.ElementType;
  matchPaths?: string[];
}[] = [
  { label: "Overview", href: "/u", icon: LayoutDashboard },
  {
    label: "Faculties",
    href: "/u/faculties",
    icon: BookOpen,
    matchPaths: ["/u/departments", "/u/lecturers", "/u/courses", "/u/timetable"],
  },
  { label: "Resources", href: "/u/resources", icon: FolderOpen },
  { label: "Notifications", href: "/u/notifications", icon: Bell },
  { label: "Settings", href: "/u/settings", icon: Settings },
];

const ROLE_LABEL = "University Admin";

// ─── Sub-components ─────────────────────────────────────────────────────────

interface SidebarProps {
  user: { name: string; email: string; role: Role };
  university: { name: string; short_name: string } | null;
  pathname: string;
  activeFaculty: string | null;
  setSidebarOpen: (open: boolean) => void;
  onSignOut: () => void;
}

const SidebarContent = ({
  user,
  university,
  pathname,
  activeFaculty,
  setSidebarOpen,
  onSignOut,
}: SidebarProps) => {
  const navItems = NAV_ITEMS;

  return (
    <aside
      style={{
        width: "240px",
        height: "100vh",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-primary)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 12px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sidebar background SVGs (5 items) */}
      <div className="blueprint-bg-item absolute" style={{ top: "4%", right: "-15px", width: "110px", height: "110px", animation: "float-1 9s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="50" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="150" cy="150" r="20" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="blueprint-bg-item absolute" style={{ top: "28%", left: "-15px", width: "100px", height: "100px", animation: "float-2 11s ease-in-out infinite", animationDelay: "1s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 60,80 C 60,70 120,70 120,80 L 120,120 C 120,130 60,130 60,120 Z" stroke="var(--brand, #008751)" strokeWidth="1.25" />
        </svg>
      </div>
      <div className="blueprint-bg-item absolute" style={{ top: "52%", right: "-15px", width: "110px", height: "110px", animation: "float-3 10s ease-in-out infinite" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M 30,50 L 110,50 L 150,110 L 270,110" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="blueprint-bg-item absolute" style={{ bottom: "20%", left: "-10px", width: "90px", height: "90px", animation: "float-1 8s ease-in-out infinite", animationDelay: "2s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <rect x="70" y="70" width="80" height="90" rx="2" stroke="var(--brand, #008751)" strokeWidth="1.25" />
        </svg>
      </div>
      <div className="blueprint-bg-item absolute" style={{ bottom: "4%", right: "-10px", width: "90px", height: "90px", animation: "float-2 9s ease-in-out infinite", animationDelay: "0.5s" }}>
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <circle cx="150" cy="150" r="40" stroke="var(--brand, #008751)" strokeWidth="1.5" />
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", position: "relative", zIndex: 10 }}>
        {/* Logo + Uni Name */}
        <div style={{ padding: "0 8px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 20 }}>
          <div>
            <UniflowLogo size={24} />
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: "6px",
                paddingLeft: "2px",
              }}
            >
              {university?.short_name || "University Portal"}
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Nav Items */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isUniversityNavActive(pathname, item.href, item.matchPaths);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  whileHover={{
                    backgroundColor: active ? undefined : "var(--bg-hover)",
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: active
                      ? "var(--brand-muted)"
                      : "transparent",
                    border: active
                      ? "1px solid var(--border-brand)"
                      : "1px solid transparent",
                    transition: "all var(--transition)",
                  }}
                >
                  <Icon
                    size={16}
                    color={active ? "var(--brand)" : "var(--text-muted)"}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: active ? 600 : 400,
                      color: active ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        backgroundColor: "var(--brand)",
                        marginLeft: "auto",
                        boxShadow: "0 0 6px var(--brand)",
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}

          {/* Active Faculty Indicator */}
          {activeFaculty && (
            <div
              style={{
                marginLeft: "12px",
                marginTop: "4px",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--brand-subtle)",
                border: "1px solid var(--border-brand)",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--brand)",
                letterSpacing: "0.03em",
              }}
            >
              {activeFaculty} Faculty
            </div>
          )}
        </nav>

        {/* User + Sign Out */}
        <div
          style={{
            borderTop: "1px solid var(--border-primary)",
            paddingTop: "16px",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              marginBottom: "4px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-hover)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--brand)",
                marginBottom: "3px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {ROLE_LABEL}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </div>
          </div>

          <motion.button
            whileHover={{ backgroundColor: "var(--danger-muted)" }}
            onClick={onSignOut}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all var(--transition)",
            }}
          >
            <LogOut size={15} color="var(--text-muted)" />
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Sign out
            </span>
          </motion.button>
        </div>
      </div>
    </aside>
  );
};

// ─── Sidebar with faculty from URL ──────────────────────────────────────────

function SidebarWithFaculty(props: Omit<SidebarProps, "activeFaculty">) {
  const searchParams = useSearchParams();
  const faculty = searchParams.get("faculty");
  return <SidebarContent {...props} activeFaculty={faculty} />;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UniversityPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { showWarning, secondsRemaining, resetTimer } = useInactivityTimeout(
    universityPortalLoginPath()
  );

  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: Role;
  } | null>(null);
  const [university, setUniversity] = useState<{
    name: string;
    short_name: string;
  } | null>(null);
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      if (isUniversityPublicPath(pathname)) {
        setUser(null);
        setUniversity(null);
        setUniversityId(null);
        setSidebarOpen(false);
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setUser(null);
          setUniversity(null);
          setUniversityId(null);
          router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
          return;
        }

        // Check university_admins table (source of truth for admin authorization)
        const { data: adminRecord, error: adminError } = await supabase
          .from("university_admins")
          .select("university_id")
          .eq("user_id", session.user.id)
          .single();

        if (adminError || !adminRecord) {
          await supabase.auth.signOut();
          setUser(null);
          setUniversity(null);
          setUniversityId(null);
          router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", session.user.id)
          .single();

        const { data: uni } = await supabase
          .from("universities")
          .select("name, short_name")
          .eq("id", adminRecord.university_id)
          .maybeSingle();

        setUser({
          name: profile?.full_name || "",
          email: session.user.email!,
          role: "university_admin",
        });
        setUniversityId(adminRecord.university_id);
        setUniversity(uni);
      } catch (err) {
        console.error("Critical error in UniversityPortalLayout:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [pathname, router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setUniversity(null);
    setUniversityId(null);
    setSidebarOpen(false);
    setLoading(false);
    router.push(universityPortalLoginPath());
  }

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--brand)" }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Loading portal...
          </p>
        </div>
      </div>
    );

  if (isUniversityPublicPath(pathname)) {
    return (
      <UniversityProvider
        value={{
          universityId: null,
          universityName: null,
          universityShortName: null,
          userEmail: null,
          isReady: true,
        }}
      >
        {children}
      </UniversityProvider>
    );
  }
  if (!user) return <>{children}</>;

  return (
    <UniversityProvider
      value={{
        universityId,
        universityName: university?.name ?? null,
        universityShortName: university?.short_name ?? null,
        userEmail: user.email,
        isReady: true,
      }}
    >
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "var(--bg-primary)",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
          50% { transform: translateY(-6px) scale(1.01) rotate(0.5deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
          50% { transform: translateY(6px) scale(0.99) rotate(-0.5deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(-4px) translateY(-4px); }
        }
        .blueprint-bg-item {
          opacity: var(--blueprint-opacity, 0.85);
          transition: opacity 0.4s ease, transform 0.4s ease;
          pointer-events: none;
          z-index: 0;
        }
        .blueprint-bg-item:hover {
          opacity: var(--blueprint-hover-opacity, 1.0);
        }
      `}</style>

      {/* Desktop Sidebar */}
      <div
        style={{ flexShrink: 0, display: "flex", position: "relative", zIndex: 10 }}
        className="desktop-sidebar"
      >
        <Suspense fallback={null}>
          <SidebarWithFaculty
            user={user}
            university={university}
            pathname={pathname}
            setSidebarOpen={setSidebarOpen}
            onSignOut={handleSignOut}
          />
        </Suspense>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
                zIndex: 40,
              }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                position: "fixed",
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 50,
                display: "flex",
              }}
            >
              <Suspense fallback={null}>
                <SidebarWithFaculty
                  user={user}
                  university={university}
                  pathname={pathname}
                  setSidebarOpen={setSidebarOpen}
                  onSignOut={handleSignOut}
                />
              </Suspense>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Grid pattern background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(var(--bg-hover) 1px, transparent 1px), linear-gradient(90deg, var(--bg-hover) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Main background blueprints (22 scattered items to cover all spaces) */}
        
        {/* 1. Cog (Top Left) */}
        <div className="blueprint-bg-item absolute" style={{ top: "3%", left: "3%", width: "clamp(80px, 12vw, 180px)", height: "clamp(80px, 12vw, 180px)", animation: "float-1 9s ease-in-out infinite" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="150" cy="150" r="50" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="150" cy="150" r="20" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 2. Cog (Top Right) */}
        <div className="blueprint-bg-item absolute" style={{ top: "4%", right: "3%", width: "clamp(80px, 10vw, 150px)", height: "clamp(80px, 10vw, 150px)", animation: "float-2 11s ease-in-out infinite" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="150" cy="150" r="40" stroke="var(--brand, #008751)" strokeWidth="1.25" />
            <circle cx="150" cy="150" r="15" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          </svg>
        </div>

        {/* 3. Broadcast Phone (Bottom Left) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "3%", left: "3%", width: "clamp(80px, 12vw, 180px)", height: "clamp(80px, 12vw, 180px)", animation: "float-2 10s ease-in-out infinite", animationDelay: "1s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <rect x="110" y="80" width="80" height="140" rx="8" stroke="var(--brand, #008751)" strokeWidth="1.5" />
            <circle cx="150" cy="150" r="80" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* 4. Broadcast Phone (Bottom Right) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "4%", right: "3%", width: "clamp(80px, 10vw, 150px)", height: "clamp(80px, 10vw, 150px)", animation: "float-1 12s ease-in-out infinite", animationDelay: "0.5s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <rect x="110" y="80" width="80" height="140" rx="8" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          </svg>
        </div>

        {/* 5. Assembly Cog (Middle Left) */}
        <div className="blueprint-bg-item absolute" style={{ top: "28%", left: "-2%", width: "clamp(80px, 10vw, 150px)", height: "clamp(80px, 10vw, 150px)", animation: "float-3 9s ease-in-out infinite" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="150" cy="150" r="50" stroke="var(--brand, #008751)" strokeWidth="1.5" strokeDasharray="4 2" />
          </svg>
        </div>

        {/* 6. Circuits (Middle Right) */}
        <div className="blueprint-bg-item absolute" style={{ top: "25%", right: "-2%", width: "clamp(80px, 10vw, 150px)", height: "clamp(80px, 10vw, 150px)", animation: "float-3 10s ease-in-out infinite", animationDelay: "1.5s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <path d="M 30,50 L 110,50 L 150,110 L 270,110" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 7. DB Hub (Bottom Middle Left) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "28%", left: "-2%", width: "clamp(80px, 10vw, 150px)", height: "clamp(80px, 10vw, 150px)", animation: "float-1 8s ease-in-out infinite", animationDelay: "2s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <rect x="110" y="20" width="80" height="40" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 8. DB Cylinders (Bottom Middle Right) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "25%", right: "-2%", width: "clamp(80px, 10vw, 150px)", height: "clamp(80px, 10vw, 150px)", animation: "float-2 9s ease-in-out infinite", animationDelay: "1s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <path d="M 60,80 C 60,70 120,70 120,80 L 120,120 C 120,130 60,130 60,120 Z" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 9. Schedule Chaos (Top Center-Left) */}
        <div className="blueprint-bg-item absolute" style={{ top: "12%", left: "20%", width: "clamp(70px, 8vw, 130px)", height: "clamp(70px, 8vw, 130px)", animation: "float-2 11s ease-in-out infinite", animationDelay: "3s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <line x1="20" y1="20" x2="280" y2="20" stroke="var(--brand, #008751)" strokeWidth="1" />
            <line x1="20" y1="120" x2="280" y2="120" stroke="var(--brand, #008751)" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* 10. Overlapping Sheets (Top Center-Right) */}
        <div className="blueprint-bg-item absolute" style={{ top: "8%", right: "20%", width: "clamp(70px, 8vw, 130px)", height: "clamp(70px, 8vw, 130px)", animation: "float-1 8s ease-in-out infinite", animationDelay: "1.5s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <rect x="50" y="50" width="120" height="140" rx="3" stroke="var(--brand, #008751)" strokeWidth="1" />
          </svg>
        </div>

        {/* 11. Chaotic Clocks (Bottom Center-Left) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "12%", left: "18%", width: "clamp(70px, 8vw, 130px)", height: "clamp(70px, 8vw, 130px)", animation: "float-3 10s ease-in-out infinite", animationDelay: "2.5s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="150" cy="150" r="80" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 12. Radar Ring (Bottom Center-Right) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "8%", right: "20%", width: "clamp(70px, 8vw, 130px)", height: "clamp(70px, 8vw, 130px)", animation: "float-3 9s ease-in-out infinite", animationDelay: "0.5s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="150" cy="150" r="40" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 13. Radar Mesh (Top Center) */}
        <div className="blueprint-bg-item absolute" style={{ top: "2%", left: "45%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-1 9s ease-in-out infinite" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="150" cy="150" r="50" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* 14. Network Nodes (Bottom Center) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "2%", left: "45%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-2 10s ease-in-out infinite", animationDelay: "1s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="100" cy="100" r="10" stroke="var(--brand, #008751)" strokeWidth="1.25" />
            <circle cx="200" cy="100" r="10" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          </svg>
        </div>

        {/* 15. DB Cylinders Small (Center Left Inner) */}
        <div className="blueprint-bg-item absolute" style={{ top: "44%", left: "18%", width: "clamp(60px, 6vw, 100px)", height: "clamp(60px, 6vw, 100px)", animation: "float-3 12s ease-in-out infinite", animationDelay: "2s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <path d="M 80,100 C 80,92 140,92 140,100 L 140,140 C 140,148 80,148 80,140 Z" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          </svg>
        </div>

        {/* 16. Sheets Small (Center Right Inner) */}
        <div className="blueprint-bg-item absolute" style={{ top: "44%", right: "18%", width: "clamp(60px, 6vw, 100px)", height: "clamp(60px, 6vw, 100px)", animation: "float-3 8s ease-in-out infinite", animationDelay: "0.5s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <rect x="70" y="70" width="80" height="90" rx="2" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          </svg>
        </div>

        {/* 17. Radar Scan (Bottom Center Left Inner) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "44%", left: "18%", width: "clamp(60px, 6vw, 100px)", height: "clamp(60px, 6vw, 100px)", animation: "float-2 11s ease-in-out infinite" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="150" cy="150" r="50" stroke="var(--brand, #008751)" strokeWidth="1" />
          </svg>
        </div>

        {/* 18. Circuits Small (Bottom Center Right Inner) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "44%", right: "18%", width: "clamp(60px, 6vw, 100px)", height: "clamp(60px, 6vw, 100px)", animation: "float-1 9s ease-in-out infinite", animationDelay: "1.5s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <path d="M 50,100 L 120,100 L 150,150 L 220,150" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          </svg>
        </div>

        {/* 19. Radar Mesh Small (Top Left Inner) */}
        <div className="blueprint-bg-item absolute" style={{ top: "12%", left: "8%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-1 10s ease-in-out infinite" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <circle cx="150" cy="150" r="70" stroke="var(--brand, #008751)" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* 20. Cylinder Small (Top Right Inner) */}
        <div className="blueprint-bg-item absolute" style={{ top: "12%", right: "8%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-2 11s ease-in-out infinite", animationDelay: "0.5s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <path d="M 60,80 C 60,70 120,70 120,80 L 120,120 Z" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          </svg>
        </div>

        {/* 21. Circuits Small (Bottom Left Inner) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "12%", left: "8%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-3 9s ease-in-out infinite" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <path d="M 30,50 L 150,50 L 200,100 L 270,100" stroke="var(--brand, #008751)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 22. Server Small (Bottom Right Inner) */}
        <div className="blueprint-bg-item absolute" style={{ bottom: "12%", right: "8%", width: "clamp(60px, 8vw, 130px)", height: "clamp(60px, 8vw, 130px)", animation: "float-1 12s ease-in-out infinite", animationDelay: "1s" }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <rect x="50" y="40" width="80" height="150" rx="3" stroke="var(--brand, #008751)" strokeWidth="1.25" />
          </svg>
        </div>

        <header className="mobile-top-bar" style={{ position: "relative", zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mobile-menu-btn"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <UniflowLogo size={22} />
          <span className="mobile-top-bar-title uppercase">
            {university?.short_name || "University Portal"}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <ThemeToggle />
          </div>
        </header>

        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: "clamp(20px, 4vw, 40px)",
            position: "relative",
            zIndex: 10,
          }}
        >
          {children}
        </main>
      </div>

      <InactivityWarningDialog
        isOpen={showWarning}
        secondsRemaining={secondsRemaining}
        onKeepWorking={resetTimer}
        onLogout={handleSignOut}
      />

    </div>
    </UniversityProvider>
  );
}
