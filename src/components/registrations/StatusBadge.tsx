'use client'

import { Clock, CheckCircle2, XCircle } from 'lucide-react'

const statusConfig = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'Pending' },
  approved: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', icon: CheckCircle2, label: 'Approved' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: XCircle, label: 'Rejected' },
}

export default function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const s = statusConfig[status]
  const Icon = s.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 700,
      color: s.color, backgroundColor: s.bg,
      border: `1px solid ${s.border}`,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      <Icon size={11} strokeWidth={2.5} />
      {s.label}
    </span>
  )
}