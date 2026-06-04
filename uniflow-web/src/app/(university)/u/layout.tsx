'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import UniflowLogo from '@/components/ui/UniflowLogo'
import {
  LayoutDashboard,
  BookOpen,
  Building2,
  Users,
  CalendarDays,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Settings,
  GraduationCap,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// ─── Role-based nav config ───────────────────────────────────────────────────

type Role = 'university_admin' | 'dean' | 'hod'

const NAV_ITEMS: Record<Role, { label: string; href: string; icon: React.ElementType }[]> = {
  university_admin: [
    { label: 'Overview', href: '/u', icon: LayoutDashboard },
    { label: 'Faculties', href: '/u/faculties', icon: BookOpen },
    { label: 'Departments', href: '/u/departments', icon: Building2 },
    { label: 'Lecturers', href: '/u/lecturers', icon: Users },
    { label: 'Timetable', href: '/u/timetable', icon: CalendarDays },
    { label: 'Settings', href: '/u/settings', icon: Settings },
  ],
  dean: [
    { label: 'Overview', href: '/u', icon: LayoutDashboard },
    { label: 'Departments', href: '/u/departments', icon: Building2 },
    { label: 'Lecturers', href: '/u/lecturers', icon: Users },
    { label: 'Settings', href: '/u/settings', icon: Settings },
  ],
  hod: [
    { label: 'Overview', href: '/u', icon: LayoutDashboard },
    { label: 'Lecturers', href: '/u/lecturers', icon: Users },
    { label: 'Timetable', href: '/u/timetable', icon: CalendarDays },
    { label: 'Settings', href: '/u/settings', icon: Settings },
  ],
}

const ROLE_LABELS: Record<Role, string> = {
  university_admin: 'University Admin',
  dean: 'Dean',
  hod: 'Head of Department',
}

// ─── Sub-components ─────────────────────────────────────────────────────────

interface SidebarProps {
  mobile?: boolean
  user: { name: string; email: string; role: Role }
  university: { name: string; short_name: string } | null
  pathname: string
  setSidebarOpen: (open: boolean) => void
  onSignOut: () => void
}

const Sidebar = ({
  mobile = false,
  user,
  university,
  pathname,
  setSidebarOpen,
  onSignOut,
}: SidebarProps) => {
  const navItems = NAV_ITEMS[user.role] ?? []

  return (
    <aside
      className={mobile ? '' : 'desktop-sidebar'}
      style={{
        width: mobile ? '100%' : '260px',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: mobile ? 'relative' : 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      {/* Logo + Uni Name */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <UniflowLogo size={32} />
        </div>
        {university && (
          <div style={{
            background: 'var(--brand-subtle)',
            border: '1px solid var(--border-brand)',
            borderRadius: '10px',
            padding: '10px 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={14} style={{ color: 'var(--brand)' }} />
              <span style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {university.short_name}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', marginLeft: '22px' }}>
              {university.name}
            </p>
          </div>
        )}
      </div>

      {/* Role Badge */}
      <div style={{ padding: '12px 20px' }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
        }}>
          {ROLE_LABELS[user.role]}
        </span>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                marginBottom: '2px',
                textDecoration: 'none',
                background: active ? 'var(--brand-muted)' : 'transparent',
                border: active ? '1px solid var(--border-brand)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon
                size={16}
                style={{ color: active ? 'var(--brand)' : 'var(--text-muted)', flexShrink: 0 }}
              />
              <span style={{
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
                {label}
              </span>
              {active && (
                <ChevronRight size={12} style={{ color: 'var(--brand)', marginLeft: 'auto' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand), var(--brand-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 12px',
            borderRadius: '8px',
            background: 'var(--danger-muted)',
            border: '1px solid var(--danger-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={14} style={{ color: 'var(--danger)' }} />
          <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 500 }}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UniversityPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<{ name: string; email: string; role: Role } | null>(null)
  const [university, setUniversity] = useState<{ name: string; short_name: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      try {
        console.log('Loading session for path:', pathname)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setLoading(false)
          return
        }

        console.log('Session status:', !!session)
        
        if (!session) {
          if (pathname !== '/u/login') {
            console.log('No session, redirecting to login')
            router.push('/u/login')
          } else {
            setLoading(false)
          }
          return
        }

        console.log('Fetching profile for user:', session.user.id)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, role, university_id')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          // On login page, don't block if profile fetch fails
          if (pathname === '/u/login') {
            setLoading(false)
            return
          }
          // For other pages, we might need a profile, but let's not hang
          setLoading(false)
          return
        }

        if (!profile || !['university_admin', 'dean', 'hod'].includes(profile.role)) {
          console.log('Invalid profile or role:', profile?.role)
          await supabase.auth.signOut()
          if (pathname !== '/u/login') {
            router.push('/u/login')
          } else {
            setLoading(false)
          }
          return
        }

        console.log('Fetching university data for ID:', profile.university_id)
        const { data: uni, error: uniError } = await supabase
          .from('universities')
          .select('name, short_name')
          .eq('id', profile.university_id)
          .single()

        if (uniError) {
          console.error('University fetch error:', uniError)
        }

        console.log('Setting user and university data')
        setUser({ name: profile.full_name, email: session.user.email!, role: profile.role as Role })
        setUniversity(uni)
      } catch (err) {
        console.error('Critical error in UniversityPortalLayout:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSession()
  }, [pathname, router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/u/login')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading portal...</p>
      </div>
    </div>
  )

  // Skip sidebar/topbar for login page
  if (pathname === '/u/login') return <>{children}</>

  // If session loaded but no user data (e.g. fetch failed), still try to render children
  // though many pages might need the user object.
  if (!user) return <>{children}</>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Desktop Sidebar */}
      <Sidebar
        user={user}
        university={university}
        pathname={pathname}
        setSidebarOpen={setSidebarOpen}
        onSignOut={handleSignOut}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40, backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className="mobile-menu-btn"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '260px',
          height: '100vh',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <Sidebar
          mobile
          user={user}
          university={university}
          pathname={pathname}
          setSidebarOpen={setSidebarOpen}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }} className="u-main-content">

        {/* Topbar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'var(--bg-primary)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-primary)',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'none',
            }}
          >
            {sidebarOpen
              ? <X size={20} style={{ color: 'var(--text-primary)' }} />
              : <Menu size={20} style={{ color: 'var(--text-primary)' }} />
            }
          </button>

          {/* Page context — filled in by each page via slot, for now blank */}
          <div />

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              background: 'transparent',
              border: '1px solid var(--border-secondary)',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Bell size={15} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand), var(--brand-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 28px 40px' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .u-main-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
