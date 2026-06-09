'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import UniflowLogo from '@/components/ui/UniflowLogo';
import {
  LayoutDashboard, Building2, CheckSquare,
  Settings, LogOut, Menu, Bell
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Registrations', href: '/dashboard/registrations', icon: Building2 },
  { label: 'Universities', href: '/dashboard/universities', icon: CheckSquare },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarContentProps {
  pathname: string;
  userEmail: string;
  setSidebarOpen: (open: boolean) => void;
  handleSignOut: () => void;
}

const SidebarContent = ({ pathname, userEmail, setSidebarOpen, handleSignOut }: SidebarContentProps) => (
  <div style={{
    width: '240px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 12px',
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-primary)',
  }}>
    {/* logo */}
    <div style={{ padding: '0 8px', marginBottom: '32px' }}>
      <UniflowLogo size={24} />
      <div style={{
        fontSize: '10px', fontWeight: 600,
        color: 'var(--text-muted)', letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        marginTop: '6px', paddingLeft: '2px',
      }}>
        Super Admin
      </div>
    </div>

    {/* nav items */}
    <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {navItems.map(item => {
        const Icon = item.icon
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            style={{ textDecoration: 'none' }}
          >
            <motion.div
              whileHover={{ backgroundColor: active ? undefined : 'var(--bg-hover)' }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                backgroundColor: active ? 'var(--brand-muted)' : 'transparent',
                border: active ? '1px solid var(--border-brand)' : '1px solid transparent',
                transition: 'all var(--transition)',
              }}
            >
              <Icon
                size={16}
                color={active ? 'var(--brand)' : 'var(--text-muted)'}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span style={{
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
                {item.label}
              </span>
              {active && (
                <div style={{
                  width: '4px', height: '4px', borderRadius: '50%',
                  backgroundColor: 'var(--brand)',
                  marginLeft: 'auto',
                  boxShadow: '0 0 6px var(--brand)',
                }} />
              )}
            </motion.div>
          </Link>
        )
      })}
    </nav>

    {/* user + sign out */}
    <div style={{
      borderTop: '1px solid var(--border-primary)',
      paddingTop: '16px',
    }}>
      <div style={{
        padding: '10px 12px', marginBottom: '4px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-hover)',
        border: '1px solid var(--border-primary)',
      }}>
        <div style={{
          fontSize: '10px', fontWeight: 700,
          color: 'var(--brand)', marginBottom: '3px',
          textTransform: 'uppercase' as const, letterSpacing: '0.06em',
        }}>
          Uniflow Admin
        </div>
        <div style={{
          fontSize: '11px', color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {userEmail}
        </div>
      </div>

      <motion.button
        whileHover={{ backgroundColor: 'var(--danger-muted)' }}
        onClick={handleSignOut}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          backgroundColor: 'transparent', border: 'none',
          cursor: 'pointer',
          transition: 'all var(--transition)',
        }}
      >
        <LogOut size={15} color="var(--text-muted)" />
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sign out</span>
      </motion.button>
    </div>
  </div>
)

export default function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return; }
      setUserEmail(data.user.email || '');
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-primary)',
    }}>

      {/* ── desktop sidebar ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
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
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 40,
              }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', left: 0, top: 0, bottom: 0,
                zIndex: 50, display: 'flex',
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
      <div style={{
        flex: 1, display: 'flex',
        flexDirection: 'column', overflow: 'hidden',
        position: 'relative',
      }}>

        {/* mobile menu button (floating since header is gone) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 35,
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <Menu size={20} />
        </button>

        {/* page content */}
        <div style={{
          flex: 1, overflow: 'auto',
          padding: 'clamp(20px, 4vw, 40px)',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}