'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTA() {
  return (
    <section style={{
        padding: 'clamp(80px, 20vw, 120px) 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(29,78,216,0.3)',
            overflow: 'hidden',
            padding: 'clamp(56px, 9vw, 100px) clamp(32px, 6vw, 80px)',
            textAlign: 'center',
            backgroundColor: 'rgba(29,78,216,0.06)',
            boxShadow: '0 12px 48px rgba(29,78,216,0.08)',
            transition: 'all 0.4s ease',
          }}
        >
          {/* background effects */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(29,78,216,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(29,78,216,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }} />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '-40%', left: '50%',
              transform: 'translateX(-50%)',
              width: '700px', height: '500px',
              background: 'radial-gradient(ellipse, rgba(29,78,216,0.15) 0%, transparent 65%)',
              pointerEvents: 'none',
            }}
          />
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{
              position: 'absolute', bottom: '-25%', right: '-5%',
              width: '450px', height: '450px',
              background: 'radial-gradient(circle, rgba(29,78,216,0.1) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          {/* content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* icon */}
            <motion.div
              animate={{ rotate: [0, 12, -8, 0], y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.1 }}
              style={{
                display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center',
                width: '64px', height: '64px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(29,78,216,0.15)',
                border: '1px solid rgba(29,78,216,0.3)',
                marginBottom: '32px',
                cursor: 'default',
                boxShadow: '0 8px 24px rgba(29,78,216,0.15)',
                transition: 'all 0.4s ease',
              }}
            >
              <Sparkles size={28} color="var(--brand)" strokeWidth={1.5} />
            </motion.div>

            {/* headline */}
            <div style={{ overflow: 'hidden', marginBottom: '8px' }}>
              <motion.h2
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(32px, 5vw, 64px)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Stop hearing about it
              </motion.h2>
            </div>
            <div style={{ overflow: 'hidden', marginBottom: '24px' }}>
              <motion.h2
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(32px, 5vw, 64px)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  color: 'var(--brand)',
                  textShadow: '0 0 40px rgba(29,78,216,0.3)',
                  margin: 0,
                }}
              >
                on WhatsApp.
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontSize: 'clamp(15px, 1.8vw, 18px)',
                color: 'var(--text-muted)',
                lineHeight: 1.75,
                maxWidth: '500px',
                margin: '0 auto 40px',
              }}
            >
              Register your university today and be among the first
              institutions to give students and lecturers the clarity
              they deserve.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '14px', flexWrap: 'wrap',
              }}
            >
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.06, boxShadow: '0 12px 48px rgba(29,78,216,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary pulse-glow"
                  style={{
                    padding: '16px 40px', fontSize: '15px', fontWeight: 700,
                    borderRadius: 'var(--radius-lg)',
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    position: 'relative' as const,
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: 'none',
                    backgroundColor: 'var(--brand)',
                    color: '#fff',
                  }}
                >
                  Register Your University
                  <motion.span whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <ArrowRight size={16} />
                  </motion.span>
                </motion.button>
              </Link>
              <Link href="#how-it-works" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-btn"
                  style={{
                    padding: '16px 40px', fontSize: '15px', fontWeight: 700,
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  See how it works
                </motion.button>
              </Link>
            </motion.div>

            {/* trust note */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontSize: '12px', color: 'var(--text-muted)',
                marginTop: '24px',
              }}
            >
              Free to start · No credit card required · Setup in under a day
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}