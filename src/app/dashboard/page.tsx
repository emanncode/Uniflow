'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Building2, Clock, CheckCircle2, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
interface Stats {
  pending: number
  approved: number
  rejected: number
  total: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase
      .from('university_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setStats({
        pending: data.filter(r => r.status === 'pending').length,
        approved: data.filter(r => r.status === 'approved').length,
        rejected: data.filter(r => r.status === 'rejected').length,
        total: data.length,
      })
      setRecent(data.slice(0, 5))
    }
    setLoading(false)
  }

  const statCards = [
    { label: 'Total Applications', value: stats.total, icon: Building2, color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  ]

  return (
    <div>
      {/* header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800,
          letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: '0 0 6px',
        }}>
          Overview
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Manage Uniflow university registrations and approvals.
        </p>
      </div>

      {/* stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: '16px', marginBottom: '32px',
      }}>
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                padding: '20px', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-card)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '12px',
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {card.label}
                </span>
                <div style={{
                  width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                  backgroundColor: card.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={card.color} strokeWidth={1.8} />
                </div>
              </div>
              <div style={{
                fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900,
                letterSpacing: '-0.04em', color: card.color, lineHeight: 1,
              }}>
                {loading ? '—' : card.value}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* recent applications */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-card)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recent Applications
          </div>
          <a href="/dashboard/registrations" style={{
            fontSize: '12px', color: 'var(--brand)',
            textDecoration: 'none', fontWeight: 600,
          }}>
            View all →
          </a>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Loading...
          </div>
        ) : recent.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No applications yet.
          </div>
        ) : (
          <div>
            {recent.map((reg, i) => (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px', gap: '12px',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--border-primary)' : 'none',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {reg.university_name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {reg.short_name}-admin.uniflow.com.ng · {reg.country}
                  </div>
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '999px',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: reg.status === 'pending' ? '#f59e0b' : reg.status === 'approved' ? '#22c55e' : '#ef4444',
                  backgroundColor: reg.status === 'pending' ? 'rgba(245,158,11,0.1)' : reg.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${reg.status === 'pending' ? 'rgba(245,158,11,0.2)' : reg.status === 'approved' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  {reg.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}