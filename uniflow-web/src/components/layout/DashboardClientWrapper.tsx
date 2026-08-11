"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import UniflowLogo from "@/components/ui/UniflowLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import InactivityWarningDialog from "@/components/ui/InactivityWarningDialog";
import {
  LayoutDashboard,
  Building,
  CheckSquare,
  Settings,
  LogOut,
  Menu,
  Bell,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Registrations", href: "/dashboard/registrations", icon: Building },
  { label: "Universities", href: "/dashboard/universities", icon: CheckSquare },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarContentProps {
  pathname: string;
  userEmail: string;
  setSidebarOpen: (open: boolean) => void;
  handleSignOut: () => void;
}
const SidebarContent = ({
  pathname,
  userEmail,
  setSidebarOpen,
  handleSignOut,
}: SidebarContentProps) => (
  <div
    style={{
      width: "240px",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      padding: "24px 12px",
      backgroundColor: "var(--bg-secondary)",
      borderRight: "1px solid var(--border-primary)",
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

    {/* Sidebar content wrapper to render above background */}
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", position: "relative", zIndex: 10 }}>
      {/* logo and theme toggle */}
      <div style={{ padding: "0 8px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 20 }}>
        <div>
          <UniflowLogo size={24} />
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              marginTop: "6px",
              paddingLeft: "2px",
            }}
          >
            Super Admin
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* nav items */}
      <nav
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
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
                  backgroundColor: active ? "var(--brand-muted)" : "transparent",
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
      </nav>

      {/* user + sign out */}
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
              textTransform: "uppercase" as const,
              letterSpacing: "0.06em",
            }}
          >
            Uniflow Admin
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
            {userEmail}
          </div>
        </div>

        <motion.button
          whileHover={{ backgroundColor: "var(--danger-muted)" }}
          onClick={handleSignOut}
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
  </div>
);

export default function DashboardClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const { showWarning, secondsRemaining, resetTimer } = useInactivityTimeout("/login");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }
      setUserEmail(data.user.email || "");
    });
  }, [router, pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
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

      {/* ── desktop sidebar ── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          position: "relative",
          zIndex: 10,
        }}
        className="desktop-sidebar"
      >
        <SidebarContent
          pathname={pathname}
          userEmail={userEmail}
          setSidebarOpen={setSidebarOpen}
          handleSignOut={handleSignOut}
        />
      </div>

      {/* ── mobile sidebar overlay ── */}
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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 50,
                display: "flex",
              }}
            >
              <SidebarContent
                pathname={pathname}
                userEmail={userEmail}
                setSidebarOpen={setSidebarOpen}
                handleSignOut={handleSignOut}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── main area ── */}
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
          <span className="mobile-top-bar-title">Super Admin</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <ThemeToggle />
          </div>
        </header>

        {/* page content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "clamp(20px, 4vw, 40px)",
            position: "relative",
            zIndex: 10,
          }}
        >
          {children}
        </div>
      </div>

      <InactivityWarningDialog
        isOpen={showWarning}
        secondsRemaining={secondsRemaining}
        onKeepWorking={resetTimer}
        onLogout={handleSignOut}
      />

    </div>
  );
}
