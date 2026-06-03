'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FileQuestion } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function DashboardNotFound() {
  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      position: 'relative',
    }}>
      {/* glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(255,92,26,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '400px' }}>
        {/* icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            width: '64px', height: '64px',
            borderRadius: '18px',
            backgroundColor: 'rgba(255,92,26,0.08)',
            border: '1px solid rgba(255,92,26,0.2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 32px rgba(255,92,26,0.1)',
          }}
        >
          <FileQuestion size={28} color="var(--brand)" strokeWidth={1.5} />
        </motion.div>

        {/* badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '4px 12px', borderRadius: '999px',
            border: '1px solid rgba(255,92,26,0.2)',
            backgroundColor: 'rgba(255,92,26,0.06)',
            fontSize: '11px', fontWeight: 700,
            color: 'var(--brand)', letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            marginBottom: '16px',
          }}
        >
          404 — Page not found
        </motion.div>

        {/* headline */}
        <div style={{ overflow: 'hidden', marginBottom: '12px' }}>
          <motion.h2
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            This page doesn't exist.
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            margin: '0 0 32px',
          }}
        >
          The dashboard page you're looking for doesn't exist
          or you may not have permission to view it.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(255,92,26,0.2)' }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{
                padding: '11px 24px', fontSize: '13px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex', alignItems: 'center', gap: '7px',
              }}
            >
              <ArrowLeft size={14} />
              Back to dashboard
            </motion.button>
          </Link>
          <Link href="/dashboard/registrations" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="glass-btn"
              style={{
                padding: '11px 24px', fontSize: '13px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              Registrations
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}