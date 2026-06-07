'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import RejectModal from '@/components/registrations/RejectModal'
import RegistrationRow from '@/components/registrations/RegistrationRow'
import { Building2, Key, X, Copy, Check, Loader2 } from 'lucide-react'

export const dynamic = 'error';

type Status = 'all' | 'pending' | 'approved' | 'rejected'

interface Registration {
  id: string
  university_name: string
  short_name: string
  official_email: string
  phone: string | null
  country: string
  state: string | null
  website: string | null
  estimated_students: number | null
  contact_person_name: string
  contact_person_role: string | null
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  created_at: string
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filter, setFilter] = useState<Status>('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [tempPassword, setTempPassword] = useState<{ password: string, email: string, name: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchRegistrations = useCallback(async () => {
    const { data } = await supabase
      .from('university_registrations')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setRegistrations(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRegistrations()
  }, [fetchRegistrations])

  const handleApprove = async (id: string) => {
    const reg = registrations.find(r => r.id === id)
    if (!reg) return

    if (!confirm(`Are you sure you want to approve ${reg.university_name}?`)) return

    setActionLoading(true)

    try {
      const response = await fetch('/api/approve-university', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationId: id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve university')
      }

      setTempPassword({ 
        password: result.tempPassword, 
        email: reg.official_email,
        name: reg.university_name
      })
      await fetchRegistrations()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred'
      alert('Error: ' + message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return
    setActionLoading(true)
    await supabase
      .from('university_registrations')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', rejectTarget)
    setRejectTarget(null)
    await fetchRegistrations()
    setActionLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filtered = filter === 'all'
    ? registrations
    : registrations.filter(r => r.status === filter)

  const counts = {
    all: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  }

  return (
    <>
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            onConfirm={handleReject}
            onCancel={() => setRejectTarget(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tempPassword && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%', maxWidth: '400px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)',
                padding: '24px', position: 'relative',
              }}
            >
              <button
                onClick={() => setTempPassword(null)}
                style={{
                  position: 'absolute', right: '16px', top: '16px',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: '4px',
                }}
              >
                <X size={18} />
              </button>

              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: 'rgba(34,197,94,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px', border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <Key size={24} color="#22c55e" />
              </div>

              <h3 style={{
                fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                University Approved
              </h3>
              <p style={{
                fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px',
              }}>
                <strong>{tempPassword.name}</strong> has been approved. 
                A temporary password has been generated for <strong>{tempPassword.email}</strong>.
              </p>

              <div style={{
                padding: '16px', borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '12px', marginBottom: '20px',
              }}>
                <code style={{
                  fontSize: '16px', fontWeight: 700, color: 'var(--brand)',
                  letterSpacing: '0.05em',
                }}>
                  {tempPassword.password}
                </code>
                <button
                  onClick={() => copyToClipboard(tempPassword.password)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
                  }}
                >
                  {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                </button>
              </div>

              <button
                onClick={() => setTempPassword(null)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand)', color: 'white',
                  fontWeight: 700, fontSize: '14px', border: 'none',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div>
        {/* header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800,
            letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: '0 0 6px',
          }}>
            Registrations
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Review and manage university registration applications.
          </p>
        </div>
        {/* filter tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '24px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)', padding: '4px',
          width: 'fit-content', flexWrap: 'wrap',
        }}>
          {(['all', 'pending', 'approved', 'rejected'] as Status[]).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                fontSize: '12px', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
                transition: 'all var(--transition)',
                backgroundColor: filter === s ? 'var(--bg-tertiary)' : 'transparent',
                color: filter === s ? 'var(--text-primary)' : 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}{' '}
              <span style={{
                fontSize: '10px',
                color: filter === s
                  ? s === 'pending' ? '#f59e0b' : s === 'approved' ? '#22c55e' : s === 'rejected' ? '#ef4444' : 'var(--brand)'
                  : 'var(--text-muted)',
              }}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
            Loading registrations...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px',
            border: '1px dashed var(--border-secondary)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <Building2 size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              No {filter === 'all' ? '' : filter} registrations yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((reg, i) => (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <RegistrationRow
                  reg={reg}
                  onApprove={() => handleApprove(reg.id)}
                  onReject={(id) => setRejectTarget(id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}