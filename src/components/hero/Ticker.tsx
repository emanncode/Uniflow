'use client'

import { motion } from 'framer-motion'

const ticker = [
  '🔔 CSC301 canceled today',
  '📍 MTH201 moved to LT5',
  '⏰ PHY101 delayed 30min',
  '✅ ENG201 now ongoing',
  '🔔 BIO301 canceled today',
  '📍 CHM101 moved to Hall C',
]

export default function Ticker() {
  return (
    <div style={{
      overflow: 'hidden',
      borderTop: '1px solid var(--border-primary)',
      borderBottom: '1px solid var(--border-primary)',
      backgroundColor: 'var(--bg-secondary)',
      padding: '10px 0',
      whiteSpace: 'nowrap',
    }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'inline-flex', gap: '48px' }}
      >
        {[...ticker, ...ticker].map((item, i) => (
          <span key={i} style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {item}
            <span style={{
              width: '3px', height: '3px',
              borderRadius: '50%',
              backgroundColor: 'var(--border-secondary)',
              display: 'inline-block',
            }} />
          </span>
        ))}
      </motion.div>
    </div>
  )
}