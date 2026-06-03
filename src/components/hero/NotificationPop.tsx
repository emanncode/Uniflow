'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NotificationPop({ text, sub, icon, color, delay }: {
  text: string; sub: string; icon: string; color: string; delay: number
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 120, damping: 25, mass: 1.2 }}
          style={{
            background: 'rgba(18,15,11,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${color}30`,
            borderRadius: '14px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '200px',
            maxWidth: '240px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}15`,
          }}
        >
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            backgroundColor: `${color}15`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px', flexShrink: 0,
          }}>
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '11px', fontWeight: 600,
              color: '#f5f5f5',
              whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {text}
            </div>
            <div style={{ fontSize: '10px', color: '#71717a', marginTop: '2px' }}>
              {sub}
            </div>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: color, flexShrink: 0,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}