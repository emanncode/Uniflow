"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import UniflowLogo from "@/components/ui/UniflowLogo";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  Menu,
  Bell,
  Settings,
} from "lucide-react";

export const dynamic = "force-dynamic";

// ─── Role-based nav config ───────────────────────────────────────────────────

type Role = "university_admin";

const NAV_ITEMS: { label: string; href: string; icon: React.ElementType }[] = [
  { label: "Overview", href: "/u", icon: LayoutDashboard },
  { label: "Faculties", href: "/u/faculties", icon: BookOpen },
  { label: "Notifications", href: "/u/notifications", icon: Bell },
  { label: "Settings", href: "/u/settings", icon: Settings },
];

const ROLE_LABEL = "University Admin";

// ─── Sub-components ─────────────────────────────────────────────────────────

interface SidebarProps {
  user: { name: string; email: string; role: Role };
  university: { name: string; short_name: string } | null;
  pathname: string;
  setSidebarOpen: (open: boolean) => void;
  onSignOut: () => void;
}

const SidebarContent = ({
  user,
  university,
  pathname,
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
      }}
    >
      {/* Logo + Uni Name */}
      <div style={{ padding: "0 8px", marginBottom: "32px" }}>
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
    </aside>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function UniversityPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: Role;
  } | null>(null);
  const [university, setUniversity] = useState<{
    name: string;
    short_name: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          if (pathname !== "/u/login") router.push("/u/login");
          else setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, role, university_id")
          .eq("id", session.user.id)
          .single();

        if (
          profileError ||
          !profile ||
          profile.role !== "university_admin"
        ) {
          if (pathname !== "/u/login") {
            await supabase.auth.signOut();
            router.push("/u/login");
          } else setLoading(false);
          return;
        }

        const { data: uni } = await supabase
          .from("universities")
          .select("name, short_name")
          .eq("id", profile.university_id)
          .maybeSingle();

        setUser({
          name: profile.full_name,
          email: session.user.email!,
          role: profile.role as Role,
        });
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
    router.push("/u/login");
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

  if (pathname === "/u/login") return <>{children}</>;
  if (!user) return <>{children}</>;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg-primary)",
      }}
    >
      {/* Desktop Sidebar */}
      <div
        style={{ flexShrink: 0, display: "flex" }}
        className="desktop-sidebar"
      >
        <SidebarContent
          user={user}
          university={university}
          pathname={pathname}
          setSidebarOpen={setSidebarOpen}
          onSignOut={handleSignOut}
        />
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
              <SidebarContent
                user={user}
                university={university}
                pathname={pathname}
                setSidebarOpen={setSidebarOpen}
                onSignOut={handleSignOut}
              />
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
        <header className="mobile-top-bar">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mobile-menu-btn"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <UniflowLogo size={22} />
          <span className="mobile-top-bar-title">
            {university?.short_name || "University Portal"}
          </span>
        </header>

        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: "clamp(20px, 4vw, 40px)",
          }}
        >
          {children}
        </main>
      </div>

    </div>
  );
}
