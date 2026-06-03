'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Wifi } from 'lucide-react'
import UniflowLogo from '@/components/ui/UniflowLogo'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Sora, sans-serif',
    }}>

      {/* background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      {/* orange glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(255,92,26,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* watermark 404 */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(160px, 25vw, 320px)',
        fontWeight: 900,
        color: 'rgba(255,255,255,0.015)',
        letterSpacing: '-0.06em',
        lineHeight: 1,
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}>
        404
      </div>

      {/* logo top */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', top: '24px', left: '32px' }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <UniflowLogo size={24} />
        </Link>
      </motion.div>

      {/* main content */}
      <div style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center', maxWidth: '480px',
      }}>

        {/* icon */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          style={{
            width: '72px', height: '72px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255,92,26,0.08)',
            border: '1px solid rgba(255,92,26,0.2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 0 40px rgba(255,92,26,0.12)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <Wifi size={32} color="var(--brand)" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* 404 label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 14px', borderRadius: '999px',
            border: '1px solid rgba(255,92,26,0.2)',
            backgroundColor: 'rgba(255,92,26,0.06)',
            fontSize: '11px', fontWeight: 700,
            color: 'var(--brand)', letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            marginBottom: '20px',
          }}
        >
          Error 404
        </motion.div>

        {/* headline */}
        <div style={{ overflow: 'hidden', marginBottom: '8px' }}>
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Page not found.
          </motion.h1>
        </div>

        <div style={{ overflow: 'hidden', marginBottom: '24px' }}>
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: 'var(--brand)',
              textShadow: '0 0 30px rgba(255,92,26,0.3)',
              margin: 0,
            }}
          >
            It happens.
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            lineHeight: 1.75,
            margin: '0 0 40px',
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(255,92,26,0.25)' }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{
                padding: '13px 28px', fontSize: '14px',
                borderRadius: 'var(--radius-lg)',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}
            >
              <ArrowLeft size={15} />
              Back to home
            </motion.button>
          </Link>

          <Link href="/register" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="glass-btn"
              style={{
                padding: '13px 28px', fontSize: '14px',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              Register university
            </motion.button>
          </Link>
        </motion.div>

        {/* bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '48px',
          }}
        >
          Think this is a mistake?{' '}
          <Link href="/" style={{
            color: 'var(--brand)',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Contact support →
          </Link>
        </motion.p>
      </div>
    </main>
  )
}