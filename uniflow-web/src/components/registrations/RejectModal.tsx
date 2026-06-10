'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { XCircle, Loader2 } from 'lucide-react'

export default function RejectModal({ onConfirm, onCancel, loading }: {
  onConfirm: (reason: string) => void
  onCancel: () => void
  loading: boolean
}) {
  const [reason, setReason] = useState('')
  
  return (
    <Modal title="Reject Application" onClose={onCancel} maxWidth="440px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          backgroundColor: 'var(--danger-muted)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          alignSelf: 'center'
        }}>
          <XCircle size={20} color="var(--danger)" strokeWidth={1.8} />
        </div>

        <p style={{
          fontSize: '14px', color: 'var(--text-muted)',
          lineHeight: 1.6, margin: 0, textAlign: 'center'
        }}>
          Provide a reason for rejection. This will help the university representative understand what needs to be corrected.
        </p>

        <div>
          <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Rejection Reason *</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. We could not verify this as a registered institution. Please provide your CAC or NUC registration number."
            rows={4}
            className="input"
            style={{
              width: '100%',
              resize: 'vertical',
              lineHeight: 1.6,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            className="btn-secondary"
            style={{ flex: 1 }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason)}
            disabled={!reason.trim() || loading}
            className="btn-danger"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Reject'}
          </button>
        </div>
      </div>
    </Modal>
  )
}