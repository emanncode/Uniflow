'use client'

import {
  CheckCircle2, ChevronRight
} from 'lucide-react'

type Step = 1 | 2

export default function StepIndicator({ step }: { step: Step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
      {[1, 2].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700,
            backgroundColor: step >= s ? 'var(--brand)' : 'rgba(255,255,255,0.05)',
            color: step >= s ? '#fff' : 'var(--text-muted)',
            border: step >= s ? 'none' : '1px solid var(--border-primary)',
            transition: 'all var(--transition)',
            boxShadow: step >= s ? '0 0 16px rgba(255,92,26,0.3)' : 'none',
          }}>
            {step > s ? <CheckCircle2 size={16} /> : s}
          </div>
          <span style={{
            fontSize: '12px', fontWeight: 600,
            color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)',
            transition: 'color var(--transition)',
          }}>
            {s === 1 ? 'University Info' : 'Contact Person'}
          </span>
          {i === 0 && (
            <ChevronRight size={14} color="var(--border-secondary)" style={{ margin: '0 4px' }} />
          )}
        </div>
      ))}
    </div>
  )
}