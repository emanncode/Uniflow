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
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'

type Role = 'university_admin' | 'dean' | 'hod'

interface Stats {
  faculties: number
  departments: number
  lecturers: number
  timetableSlots: number
}

interface RecentActivity {
  id: string
  type: 'faculty_added' | 'dept_added' | 'lecturer_added' | 'timetable_set'
  label: string
  time: string
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color, href
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  color: string
  href?: string
}) {
  const content = (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'border-color 0.2s, transform 0.2s',
      cursor: href ? 'pointer' : 'default',
      textDecoration: 'none',
    }}
      onMouseEnter={e => {
        if (!href) return
          ; (e.currentTarget as HTMLElement).style.borderColor = `${color}40`
          ; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        ; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
          ; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color }} />
        </div>
        {href && <ArrowUpRight size={14} style={{ color: 'var(--text-muted)' }} />}
      </div>
      <div>
        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </p>
        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</p>
        {sub && <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</p>}
      </div>
    </div>
  )

  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link> : content
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<RecentActivity['type'], { icon: React.ElementType; color: string }> = {
  faculty_added: { icon: BookOpen, color: '#2563eb' },
  dept_added: { icon: Building2, color: '#8b5cf6' },
  lecturer_added: { icon: Users, color: '#fbbf24' },
  timetable_set: { icon: CalendarDays, color: '#22c55e' },
}

function ActivityRow({ item }: { item: RecentActivity }) {
  const { icon: Icon, color } = ACTIVITY_ICONS[item.type]
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '8px',
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.label}
        </p>
      </div>
      <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
        {item.time}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UniversityOverviewPage() {
  const [role, setRole] = useState<Role | null>(null)
  const [stats, setStats] = useState<Stats>({ faculties: 0, departments: 0, lecturers: 0, timetableSlots: 0 })
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
      const [facRes, deptRes, lecRes, ttRes] = await Promise.all([
        supabase.from('faculties').select('id', { count: 'exact', head: true }).eq('university_id', profile.university_id),
        supabase.from('departments').select('id', { count: 'exact', head: true }).eq('university_id', profile.university_id),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('university_id', profile.university_id).eq('role', 'lecturer'),
        supabase.from('timetable').select('id', { count: 'exact', head: true }).eq('university_id', profile.university_id),
      ])

      setStats({
        faculties: facRes.count ?? 0,
        departments: deptRes.count ?? 0,
        lecturers: lecRes.count ?? 0,
        timetableSlots: ttRes.count ?? 0,
      })

      // Build recent activity from latest records
      const [recentFac, recentDept, recentLec] = await Promise.all([
        supabase.from('faculties').select('name, created_at').eq('university_id', profile.university_id).order('created_at', { ascending: false }).limit(3),
        supabase.from('departments').select('name, created_at').eq('university_id', profile.university_id).order('created_at', { ascending: false }).limit(3),
        supabase.from('profiles').select('full_name, created_at').eq('university_id', profile.university_id).eq('role', 'lecturer').order('created_at', { ascending: false }).limit(3),
      ])

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
        ...(recentLec.data ?? []).map(r => ({
          id: r.full_name + r.created_at,
          type: 'lecturer_added' as const,
          label: `Lecturer onboarded — ${r.full_name}`,
          time: formatTime(r.created_at),
        })),
      ]
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 8)

      setActivity(allActivity)
      setLoading(false)
    }
    load()
  }, [])

  function formatTime(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const STAT_CARDS = [
    { icon: BookOpen, label: 'Faculties', value: stats.faculties, color: '#2563eb', href: '/u/faculties', sub: 'active faculties' },
    { icon: Building2, label: 'Departments', value: stats.departments, color: '#8b5cf6', href: '/u/departments', sub: 'across all faculties' },
    { icon: Users, label: 'Lecturers', value: stats.lecturers, color: '#fbbf24', href: '/u/lecturers', sub: 'onboarded lecturers' },
    { icon: CalendarDays, label: 'Timetable Slots', value: stats.timetableSlots, color: '#22c55e', href: '/u/timetable', sub: 'scheduled classes' },
  ]

  // Role-filtered stat cards
  const visibleCards = role === 'hod'
    ? STAT_CARDS.filter(c => ['Lecturers', 'Timetable Slots'].includes(c.label))
    : role === 'dean'
      ? STAT_CARDS.filter(c => ['Departments', 'Lecturers'].includes(c.label))
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
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {greeting()} 👋
        </h1>
        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>
          {uniName} · Portal Overview
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {visibleCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Two-column lower */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', alignItems: 'start' }}>

        {/* Recent Activity */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Activity
            </h2>
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Latest changes across your portal
          </p>

          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <TrendingUp size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
                No activity yet. Start by adding faculties or departments.
              </p>
            </div>
          ) : (
            activity.map(item => <ActivityRow key={item.id} item={item} />)
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          padding: '20px',
        }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Quick Actions
          </h2>
          <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Jump to common tasks
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {role === 'university_admin' && (
              <>
                <QuickAction href="/u/faculties" icon={BookOpen} label="Add New Faculty" color="#2563eb" />
                <QuickAction href="/u/departments" icon={Building2} label="Add Department" color="#8b5cf6" />
                <QuickAction href="/u/lecturers" icon={Users} label="Onboard Lecturers" color="#fbbf24" />
              </>
            )}
            {role === 'dean' && (
              <>
                <QuickAction href="/u/departments" icon={Building2} label="Create Department" color="#8b5cf6" />
                <QuickAction href="/u/lecturers" icon={Users} label="View Lecturers" color="#fbbf24" />
              </>
            )}
            {role === 'hod' && (
              <>
                <QuickAction href="/u/lecturers" icon={Users} label="Upload Lecturers" color="#fbbf24" />
                <QuickAction href="/u/timetable" icon={CalendarDays} label="Set Timetable" color="#22c55e" />
              </>
            )}
          </div>

          {/* Portal status */}
          <div style={{
            marginTop: '20px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
            <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px', color: '#22c55e' }}>
              Portal is live and active
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ href, icon: Icon, label, color }: { href: string; icon: React.ElementType; label: string; color: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
        onMouseEnter={e => {
          ; (e.currentTarget as HTMLElement).style.borderColor = `${color}40`
            ; (e.currentTarget as HTMLElement).style.background = `${color}0a`
        }}
        onMouseLeave={e => {
          ; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
            ; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
        }}
      >
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={13} style={{ color }} />
        </div>
        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {label}
        </span>
        <ArrowUpRight size={12} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
      </div>
    </Link>
  )
}
