'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StatusBadge from '@/components/registrations/StatusBadge'
import {
  Building2, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Globe, Mail,
  Phone, Users, User, Briefcase, ExternalLink
} from 'lucide-react'


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

export default function RegistrationRow({ reg, onApprove, onReject }: {
  reg: Registration
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--bg-card)',
      overflow: 'hidden',
      transition: 'border-color var(--transition)',
    }}>
      {/* row header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px', cursor: 'pointer',
          flexWrap: 'wrap', gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(255,92,26,0.08)',
            border: '1px solid rgba(255,92,26,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Building2 size={18} color="var(--brand)" strokeWidth={1.8} />
          </div>
          <div>
            <div style={{
              fontSize: '14px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '2px',
            }}>
              {reg.university_name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {reg.short_name}-admin.uniflow.com.ng
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StatusBadge status={reg.status} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {new Date(reg.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </div>
          {expanded
            ? <ChevronUp size={16} color="var(--text-muted)" />
            : <ChevronDown size={16} color="var(--text-muted)" />
          }
        </div>
      </div>

      {/* expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid var(--border-primary)',
              padding: '20px',
            }}>
              {/* details grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px', marginBottom: '20px',
              }}>
                {[
                  { icon: Mail, label: 'Email', value: reg.official_email },
                  { icon: Phone, label: 'Phone', value: reg.phone || '—' },
                  { icon: Globe, label: 'Country', value: reg.state ? `${reg.state}, ${reg.country}` : reg.country },
                  { icon: Users, label: 'Est. Students', value: reg.estimated_students?.toLocaleString() || '—' },
                  { icon: User, label: 'Contact Person', value: reg.contact_person_name },
                  { icon: Briefcase, label: 'Role', value: reg.contact_person_role || '—' },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-primary)',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginBottom: '6px',
                      }}>
                        <Icon size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {item.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {item.value}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* website link */}
              {reg.website && (
                <a
                  href={reg.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', color: 'var(--brand)',
                    textDecoration: 'none', marginBottom: '20px',
                    fontWeight: 600,
                  }}
                >
                  <ExternalLink size={12} />
                  {reg.website}
                </a>
              )}

              {/* rejection reason if rejected */}
              {reg.status === 'rejected' && reg.rejection_reason && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  marginBottom: '20px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Rejection Reason
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {reg.rejection_reason}
                  </div>
                </div>
              )}

              {/* action buttons — only for pending */}
              {reg.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onApprove(reg.id)}
                    style={{
                      padding: '10px 24px', borderRadius: 'var(--radius-md)',
                      fontSize: '13px', fontWeight: 700,
                      backgroundColor: 'rgba(34,197,94,0.1)',
                      color: '#22c55e',
                      border: '1px solid rgba(34,197,94,0.25)',
                      cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all var(--transition)',
                    }}
                  >
                    <CheckCircle2 size={14} />
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onReject(reg.id)}
                    style={{
                      padding: '10px 24px', borderRadius: 'var(--radius-md)',
                      fontSize: '13px', fontWeight: 700,
                      backgroundColor: 'rgba(239,68,68,0.08)',
                      color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.2)',
                      cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all var(--transition)',
                    }}
                  >
                    <XCircle size={14} />
                    Reject
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  )
}