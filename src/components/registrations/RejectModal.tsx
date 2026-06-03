'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { XCircle } from 'lucide-react'

export default function RejectModal({ onConfirm, onCancel, loading }: {
  onConfirm: (reason: string) => void
  onCancel: () => void
  loading: boolean
}) {
  const [reason, setReason] = useState('')
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          width: '100%', maxWidth: '440px',
        }}
      >
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          backgroundColor: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <XCircle size={20} color="#ef4444" strokeWidth={1.8} />
        </div>

        <h3 style={{
          fontSize: '18px', fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em', margin: '0 0 8px',
        }}>
          Reject application
        </h3>
        <p style={{
          fontSize: '13px', color: 'var(--text-muted)',
          lineHeight: 1.6, margin: '0 0 20px',
        }}>
          Provide a reason so the university rep knows what to fix.
        </p>

        <label className="label">Rejection reason *</label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. We could not verify this as a registered institution. Please provide your CAC or NUC registration number."
          rows={4}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontFamily: 'Sora, sans-serif',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.6,
            marginBottom: '20px',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--brand)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            className="glass-btn"
            style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}
          >
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason)}
            disabled={!reason.trim() || loading}
            style={{
              flex: 1, padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px', fontWeight: 700,
              backgroundColor: reason.trim() ? '#ef4444' : 'rgba(239,68,68,0.3)',
              color: '#fff', border: 'none', cursor: reason.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'Sora, sans-serif',
              transition: 'all var(--transition)',
            }}
          >
            {loading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}