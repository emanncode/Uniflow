'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BookOpen,
  Building2,
  Users,
  CalendarDays,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'

type Role = 'university_admin' | 'dean' | 'hod' | 'lecturer'

interface Stats {
  faculties: number
  departments: number
  lecturers: number
  students: number
  timetableSlots: number
}

interface RecentActivity {
  id: string
  type: 'faculty_added' | 'dept_added' | 'lecturer_added' | 'timetable_set'
  label: string
  time: string
}

const UI_COLORS = {
  blue: { main: 'var(--info)', muted: 'var(--info-muted)' },
  purple: { main: 'var(--brand)', muted: 'var(--brand-muted)' },
  yellow: { main: 'var(--warning)', muted: 'var(--warning-muted)' },
  green: { main: 'var(--success)', muted: 'var(--success-muted)' },
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, colorKey, href
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  colorKey: keyof typeof UI_COLORS
  href?: string
}) {
  const color = UI_COLORS[colorKey]

  const content = (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'all var(--transition)',
      cursor: href ? 'pointer' : 'default',
      textDecoration: 'none',
    }}
      onMouseEnter={e => {
        if (!href) return
          ; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-secondary)'
          ; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          ; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'
      }}
      onMouseLeave={e => {
        ; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'
          ; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          ; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: color.muted,
          border: `1px solid ${color.main}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color: color.main }} />
        </div>
        {href && <ArrowUpRight size={14} style={{ color: 'var(--text-muted)' }} />}
      </div>
      <div>
        <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</p>
        {sub && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</p>}
      </div>
    </div>
  )

  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link> : content
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<RecentActivity['type'], { icon: React.ElementType; colorKey: keyof typeof UI_COLORS }> = {
  faculty_added: { icon: BookOpen, colorKey: 'blue' },
  dept_added: { icon: Building2, colorKey: 'purple' },
  lecturer_added: { icon: Users, colorKey: 'yellow' },
  timetable_set: { icon: CalendarDays, colorKey: 'green' },
}

function ActivityRow({ item }: { item: RecentActivity }) {
  const { icon: Icon, colorKey } = ACTIVITY_ICONS[item.type]
  const color = UI_COLORS[colorKey]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid var(--border-primary)',
    }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '8px',
        background: color.muted,
        border: `1px solid ${color.main}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        color: 'var(--text-secondary)',
      }}>
        <Icon size={14} style={{ color: color.main }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.label}
        </p>
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
        {item.time}
      </span>
    </div>
  )
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UniversityOverviewPage() {
  const [role, setRole] = useState<Role | null>(null)
  const [stats, setStats] = useState<Stats>({ faculties: 0, departments: 0, lecturers: 0, students: 0, timetableSlots: 0 })
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [uniName, setUniName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, university_id, full_name')
        .eq('id', session.user.id)
        .single()

      if (!profile) return
      setRole(profile.role as Role)

      // Load university name
      const { data: uni } = await supabase
        .from('universities')
        .select('name')
        .eq('id', profile.university_id)
        .single()
      if (uni) setUniName(uni.name)

      // Load stats in parallel
      const [facRes, deptRes, ttRes, staffRes] = await Promise.all([
        supabase.from('faculties').select('id', { count: 'exact', head: true }).eq('university_id', profile.university_id),
        supabase.from('departments').select('id', { count: 'exact', head: true }).eq('university_id', profile.university_id),
        supabase.from('timetable').select('id', { count: 'exact', head: true }).eq('university_id', profile.university_id),
        fetch(`/api/staff?university_id=${profile.university_id}`).then(res => res.json())
      ])

      const allProfiles = (staffRes.data || []) as { role: string; full_name: string; created_at: string }[];
      const lecturersData = allProfiles.filter(p => ['lecturer', 'dean', 'hod'].includes((p.role || '').toLowerCase().trim()));
      const studentsData = allProfiles.filter(p => (p.role || '').toLowerCase().trim() === 'student');

      setStats({
        faculties: facRes.count ?? 0,
        departments: deptRes.count ?? 0,
        lecturers: lecturersData.length,
        students: studentsData.length,
        timetableSlots: ttRes.count ?? 0,
      })

      // Build recent activity from latest records
      const [recentFac, recentDept] = await Promise.all([
        supabase.from('faculties').select('name, created_at').eq('university_id', profile.university_id).order('created_at', { ascending: false }).limit(3),
        supabase.from('departments').select('name, created_at').eq('university_id', profile.university_id).order('created_at', { ascending: false }).limit(3),
      ])

      const recentLec = lecturersData.slice(0, 3);

      const allActivity: RecentActivity[] = [
        ...(recentFac.data ?? []).map(r => ({
          id: r.name + r.created_at,
          type: 'faculty_added' as const,
          label: `Faculty added — ${r.name}`,
          time: formatTime(r.created_at),
        })),
        ...(recentDept.data ?? []).map(r => ({
          id: r.name + r.created_at,
          type: 'dept_added' as const,
          label: `Department added — ${r.name}`,
          time: formatTime(r.created_at),
        })),
        ...(recentLec).map(r => ({
          id: r.full_name + r.created_at,
          type: 'lecturer_added' as const,
          label: `Lecturer onboarded — ${r.full_name}`,
          time: formatTime(r.created_at),
        })),
      ]
        .sort((a, b) => b.time.localeCompare(a.time))
        .slice(0, 8)

      setActivity(allActivity)
      setLoading(false)
    }
    load()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const STAT_CARDS: { icon: React.ElementType; label: string; value: number; colorKey: keyof typeof UI_COLORS; href: string; sub: string }[] = [
    { icon: BookOpen, label: 'Faculties', value: stats.faculties, colorKey: 'blue', href: '/u/faculties', sub: 'active faculties' },
    { icon: Building2, label: 'Departments', value: stats.departments, colorKey: 'purple', href: '/u/faculties', sub: 'manage via Faculties' },
    { icon: Users, label: 'Lecturers', value: stats.lecturers, colorKey: 'yellow', href: '/u/faculties', sub: 'staff via Faculties' },
    { icon: CalendarDays, label: 'Timetable Slots', value: stats.timetableSlots, colorKey: 'green', href: '/u/timetable', sub: 'scheduled classes' },
  ]

  // Role-filtered stat cards (Faculties is always the entry point for sub-entities)
  const visibleCards = role === 'hod'
    ? STAT_CARDS.filter(c => ['Faculties', 'Lecturers', 'Timetable Slots'].includes(c.label))
    : role === 'dean'
      ? STAT_CARDS.filter(c => ['Faculties', 'Departments', 'Lecturers'].includes(c.label))
      : STAT_CARDS

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand)' }} />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {greeting()} 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {uniName} · Portal Overview
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {visibleCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Two-column lower */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', alignItems: 'start' }}>

        {/* Recent Activity */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Activity
            </h2>
            <Clock size={13} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Latest changes across your portal
          </p>

          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <TrendingUp size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No activity yet. Start by adding faculties.
              </p>
            </div>
          ) : (
            activity.map(item => <ActivityRow key={item.id} item={item} />)
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Quick Actions
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Jump to common tasks
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {role === 'university_admin' && (
              <>
                <QuickAction href="/u/faculties" icon={BookOpen} label="Add New Faculty" colorKey="blue" />
                <QuickAction href="/u/faculties" icon={Building2} label="Manage Departments" colorKey="purple" />
                <QuickAction href="/u/faculties" icon={Users} label="Onboard Staff" colorKey="yellow" />
              </>
            )}
            {role === 'dean' && (
              <>
                <QuickAction href="/u/faculties" icon={Building2} label="Manage Departments" colorKey="purple" />
                <QuickAction href="/u/faculties" icon={Users} label="Manage Staff" colorKey="yellow" />
              </>
            )}
            {role === 'hod' && (
              <>
                <QuickAction href="/u/faculties" icon={Users} label="Manage Staff" colorKey="yellow" />
                <QuickAction href="/u/timetable" icon={CalendarDays} label="Set Timetable" colorKey="green" />
              </>
            )}
          </div>

          {/* Portal status */}
          <div style={{
            marginTop: '20px',
            background: 'var(--success-muted)',
            border: '1px solid var(--success-muted)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
            <p style={{ fontSize: '12px', color: 'var(--success)' }}>
              Portal is live and active
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ href, icon: Icon, label, colorKey }: { href: string; icon: React.ElementType; label: string; colorKey: keyof typeof UI_COLORS }) {
  const color = UI_COLORS[colorKey]

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1px solid var(--border-primary)',
        background: 'var(--bg-hover)',
        cursor: 'pointer',
        transition: 'all var(--transition)',
      }}
        onMouseEnter={e => {
          ; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-secondary)'
            ; (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'
        }}
        onMouseLeave={e => {
          ; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'
            ; (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
        }}
      >
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: color.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={13} style={{ color: color.main }} />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {label}
        </span>
        <ArrowUpRight size={12} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
      </div>
    </Link>
  )
}
